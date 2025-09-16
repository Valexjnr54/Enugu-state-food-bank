import * as xlsx from 'xlsx';
import * as fs from 'fs-extra';
import * as path from 'path';

interface Row {
  firstname: string | null;
  lastname: string | null;
  email: null;
  phone: null;
  level: string | null;
  employee_id: string | null;
  verification_id: string | null;
  government_entity: string | null;
  salary_per_month: number | null;
}

function extractRows(filePath: string): Row[] {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const json = xlsx.utils.sheet_to_json<any>(sheet);

  return json.map((row: any) => ({
    firstname: [row['First Name'], row['Middle Name']].filter(Boolean).join(' ').trim() || null,
    lastname: row['Surname'] || null,
    email: null,
    phone: null,
    level: row['Grade/Step'] || null,
    employee_id: row['EmploymentNumber'] || null,
    verification_id: row['Verification_no'] || null,
    government_entity: row['MDA'] || null,
    salary_per_month: row['MONTHLY_PAY'] != null ? Number(row['MONTHLY_PAY']) : null,
  }));
}

async function main() {
  const inputDir = path.resolve(__dirname, '../../public/civil_servants/input'); // inside project
  const outputFile = path.resolve(__dirname, '../../public/civil_servants/output/transformed.csv'); // inside project

  const files = await fs.readdir(inputDir);
  const excelFiles = files.filter(f => f.endsWith('.xlsx'));

  const allRows: Row[] = [];

  for (const file of excelFiles) {
    const filePath = path.join(inputDir, file);
    const rows = extractRows(filePath);
    allRows.push(...rows);
  }

  const csv = [
    'firstname,lastname,email,phone,level,employee_id,verification_id,government_entity,salary_per_month',
    ...allRows.map(r =>
      [
        r.firstname,
        r.lastname,
        r.email,
        r.phone,
        r.level,
        r.employee_id,
        r.verification_id,
        r.government_entity,
        // Output salary_per_month as float (no quotes, empty if null)
        r.salary_per_month !== null ? r.salary_per_month : ''
      ].map((v, i) => {
        // Only quote non-numeric fields
        if (i === 8) return v; // salary_per_month (float, no quotes)
        return v === null ? '' : `"${v}"`;
      }).join(',')
    ),
  ].join('\n');

  await fs.ensureDir(path.dirname(outputFile));
  await fs.writeFile(outputFile, csv, 'utf8');

  console.log(`✅ CSV written to ${outputFile}`);
}

main().catch(console.error);