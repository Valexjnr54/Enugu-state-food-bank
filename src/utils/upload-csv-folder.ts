import * as fs from 'fs';
import * as path from 'path';

type Dependencies = {
  prisma: any;
  UserService: any;
  runValidation: (data: any, validator: any) => Promise<any>;
  validateUser: any;
  PrismaClientKnownRequestError?: any;
};

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && line[i + 1] === '"') {
      current += '"';
      i++; // skip escaped quote
      continue;
    }
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  result.push(current);
  return result.map(s => s.trim());
}

/**
 * Read every CSV file in `folderPath` and upload rows to DB.
 * Skips rows where firstname is empty or equals "First Name" (case-insensitive).
 */
export async function uploadUsersFromCsvFolder(
  folderPath: string,
  deps: Dependencies,
  options?: { batchSize?: number; percent?: number }
): Promise<{ results: any[]; errors: any[] }> {
  const { prisma, UserService, runValidation, validateUser, PrismaClientKnownRequestError } = deps;
  const BATCH_SIZE = options?.batchSize ?? 100;
  const percent = options?.percent ?? 0.3;

  const results: any[] = [];
  const errors: any[] = [];

  if (!fs.existsSync(folderPath)) {
    throw new Error(`Folder not found: ${folderPath}`);
  }

  const files = fs.readdirSync(folderPath).filter(f => f.toLowerCase().endsWith('.csv'));
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    let content: string;
    try {
      content = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
      errors.push({ file, message: 'Unable to read file', error: err });
      continue;
    }

    const rawRows = content.split(/\r?\n/).map(r => r.trim()).filter(Boolean);
    if (rawRows.length === 0) continue;

    const headers = parseCSVLine(rawRows[0]).map(h => h.trim());
    const headersNorm = headers.map(h => h.toLowerCase());
    const idxFirstName = headersNorm.findIndex(h => h === 'firstname' || h === 'first name' || h === 'first_name');
    const idxEmail = headersNorm.findIndex(h => h === 'email');
    const idxPhone = headersNorm.findIndex(h => h === 'phone');
    const idxSalary = headersNorm.findIndex(h => h === 'salary_per_month' || h === 'salary' || h === 'monthly_pay');
    const idxVerification = headersNorm.findIndex(h => h === 'verification_id' || h === 'verification no' || h === 'verification_no' || h === 'verification');

    if (idxVerification === -1) {
      errors.push({ file, message: 'Missing verification_id header' });
      continue;
    }

    let batch: any[] = [];

    for (let i = 1; i < rawRows.length; i++) {
      const line = rawRows[i];
      const values = parseCSVLine(line);
      const rowData: any = {};

      headers.forEach((header, index) => {
        rowData[header.trim()] = values[index] !== undefined ? values[index].trim() : '';
      });

      // Normalize keys to the header names used later
      // Ensure firstname exists and is not the header placeholder
      const firstNameVal =
        idxFirstName !== -1 ? (values[idxFirstName] || '').trim() : (rowData['firstname'] || rowData['FirstName'] || '');
      if (!firstNameVal || firstNameVal.toLowerCase() === 'first name') {
        // skip
        continue;
      }

      // map commonly used fields into expected keys
      const email = idxEmail !== -1 ? (values[idxEmail] || '').trim() : (rowData.email || '');
      const phone = idxPhone !== -1 ? (values[idxPhone] || '').trim() : (rowData.phone || '');
      const salaryRaw = idxSalary !== -1 ? (values[idxSalary] || '').trim() : (rowData.salary_per_month || rowData.salary || '0');
      const salary = parseFloat(String(salaryRaw).replace(/[^\d.-]/g, '')) || 0;
      const verification =
        idxVerification !== -1 ? (values[idxVerification] || '').trim() : (rowData.verification_id || rowData.Verification_no || '');

      // Build canonical payload matching your existing uploadUsersFromCSV expectations
      const payload: any = {
        // prefer lower-case header keys if present
        firstname: firstNameVal,
        lastname:
          headersNorm.indexOf('lastname') !== -1
            ? (values[headersNorm.indexOf('lastname')] || '').trim()
            : (rowData.lastname || rowData.Surname || ''),
        email: email === '' ? null : email,
        phone: phone === '' ? null : phone,
        level: rowData.level ?? rowData.GradeStep ?? '',
        employee_id: rowData.employee_id ?? rowData.EmploymentNumber ?? null,
        verification_id: verification,
        government_entity: rowData.government_entity ?? rowData.MDA ?? '',
        salary_per_month: salary
      };

      // run validation
      try {
        // validate a shallow copy to prevent express-validator (or similar) from
        // mutating the object and adding internal keys like "express-validator#contexts"
        const toValidate = { ...payload };
        const validationRes = await runValidation(toValidate, validateUser);
        const hasErrors =
          typeof validationRes?.isEmpty === 'function'
            ? !validationRes.isEmpty()
            : !!(validationRes && (validationRes.errors || validationRes.length));

        if (hasErrors) {
          errors.push({
            file,
            row: i + 1,
            errors: validationRes?.array ? validationRes.array() : validationRes
          });
          continue;
        }
      } catch (err) {
        errors.push({ file, row: i + 1, message: 'Validation error', error: err });
        continue;
      }

      // compute loan_unit and keep row index for error reporting
      const loan_unit = percent * payload.salary_per_month;
      batch.push({ ...payload, loan_unit, __row: i + 1 });

      // process batch
      if (batch.length >= BATCH_SIZE || i === rawRows.length - 1) {
        const batchResults = await Promise.allSettled(
          batch.map(async userData => {
            // whitelist fields to ensure we only send plain scalars to Prisma
            const empRaw = (userData.employee_id ?? '').toString().trim();
            const employee_id = empRaw === '' ? null : empRaw;

            const dbData: any = {
              firstname: userData.firstname,
              lastname: userData.lastname,
              email: userData.email ?? null,
              phone: userData.phone ?? null,
              level: userData.level,
              employee_id,
              verification_id: userData.verification_id,
              government_entity: userData.government_entity,
              salary_per_month: Number(userData.salary_per_month) || 0,
              loan_unit: Number(userData.loan_unit) || 0
            };

            try {
              const existingUser = await prisma.user.findUnique({
                where: { verification_id: dbData.verification_id }
              });

              if (existingUser) {
                if (existingUser.loan_amount_collected && existingUser.loan_amount_collected > 0) {
                  return { skipped: true, verification_id: dbData.verification_id };
                } else {
                  const updated = await prisma.user.update({
                    where: { verification_id: dbData.verification_id },
                    data: dbData
                  });
                  results.push(updated);
                  return { updated: true, verification_id: dbData.verification_id };
                }
              } else {
                const savedUser = await UserService.create(dbData);
                results.push(savedUser);
                return { created: true, verification_id: dbData.verification_id };
              }
            } catch (err: any) {
              const rowNum = userData.__row ?? 'unknown';
              if (PrismaClientKnownRequestError && err instanceof PrismaClientKnownRequestError) {
                errors.push({ file, message: err.message, row: rowNum });
              } else {
                errors.push({ file, message: err?.message ?? 'Unknown error', row: rowNum });
              }
              return { error: true, verification_id: dbData.verification_id };
            }
          })
        );
        // reset batch
        batch = [];
      }
    } // end rows loop
  } // end files loop

  return { results, errors };
}
