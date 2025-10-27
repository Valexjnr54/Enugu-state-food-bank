import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

interface EmployeeRecord {
  EmploymentNumber: string | null;
  Verification_no: string;
  Surname: string;
  FirstName: string;
  MiddleName: string;
  GradeStep: string;
  MDA: string;
  MONTHLY_PAY: number;
}

interface ExtractedEmployee {
  firstname: string;
  lastname: string;
  email: null | string;
  phone: null | string;
  level: string;
  employee_id: string | null;
  verification_id: string;
  government_entity: string;
  salary_per_month: number;
}

class EmployeeDataExtractor {
  private inputDirectory: string;
  private outputDirectory: string;

  constructor(inputDirectory: string, outputDirectory: string) {
    this.inputDirectory = inputDirectory;
    this.outputDirectory = outputDirectory;
  }

  private normalize(value: unknown): string {
    // preserve zeros and falsey non-null values
    if (value === undefined || value === null) return '';
    return String(value).trim().toLowerCase();
  }

  private getHeaderIndex(headers: string[], possibleNames: string[] | string): number {
    const names = Array.isArray(possibleNames) ? possibleNames : [possibleNames];
    const normalizedHeaders = headers.map(h => this.normalize(h));
    for (const name of names) {
      const n = this.normalize(name);
      // try exact match first
      let idx = normalizedHeaders.indexOf(n);
      if (idx !== -1) return idx;
      // fallback: contains
      idx = normalizedHeaders.findIndex(h => h.includes(n) || n.includes(h));
      if (idx !== -1) return idx;
    }
    return -1;
  }

  private readExcelFile(filePath: string): EmployeeRecord[] {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

      if (!Array.isArray(data) || data.length < 1) {
        console.warn(`⚠️ File ${filePath} has no data`);
        return [];
      }

      // 1️⃣ Find header row (row containing "Verification")
      let headerRowIndex = -1;
      for (let i = 0; i < data.length; i++) {
        const rowCells = Array.isArray(data[i]) ? data[i] : [];
        const row = rowCells.map(v => this.normalize(v));
        if (row.some(v => v.includes('verification') || v.includes('verification_no') || v.includes('verification no'))) {
          headerRowIndex = i;
          break;
        }
      }

      if (headerRowIndex === -1) {
        console.warn(`⚠️ No 'Verification No' header found in ${filePath}`);
        return [];
      }

      // 2️⃣ Extract Department (MDA) from lines above header
      let MDA = '';
      for (let i = headerRowIndex - 1; i >= 0; i--) {
        const line = Array.isArray(data[i]) ? data[i].join(' ') : String(data[i] || '');
        const match = line.match(/department[:\s-]*([\w\s().\/&-]+)/i);
        if (match && match[1]) {
          MDA = match[1].trim();
          break;
        }
        // fallback: if a non-empty line that doesn't look like header, use it
        if (!MDA && line.trim()) {
          // keep scanning upward but remember a candidate (don't break immediately)
          MDA = line.trim();
        }
      }

      // 3️⃣ Parse header and data rows
      const headerRow = Array.isArray(data[headerRowIndex]) ? data[headerRowIndex] : [];
      const headers = headerRow.map(h => (h === undefined || h === null ? '' : String(h).trim()));
      const rows = data.slice(headerRowIndex + 1);

      const employeeRecords: EmployeeRecord[] = [];

      for (const rowRaw of rows) {
        if (!Array.isArray(rowRaw) || rowRaw.length === 0) continue;
        const row = rowRaw;

        const getString = (possibleHeaders: string[] | string) => {
          const idx = this.getHeaderIndex(headers, possibleHeaders);
          return idx !== -1 && row[idx] !== undefined && row[idx] !== null ? String(row[idx]).trim() : '';
        };

        const getNullableString = (possibleHeaders: string[] | string): string | null => {
          const val = getString(possibleHeaders);
          return val === '' ? null : val;
        };

        const getNumber = (possibleHeaders: string[] | string): number => {
          const idx = this.getHeaderIndex(headers, possibleHeaders);
          if (idx === -1 || row[idx] === undefined || row[idx] === null) return 0;
          const val = row[idx];
          if (typeof val === 'number') return val;
          const num = parseFloat(String(val).replace(/[^\d.-]/g, ''));
          return isNaN(num) ? 0 : num;
        };

        const record: EmployeeRecord = {
          EmploymentNumber: getNullableString(['EmploymentNumber', 'Employment Number', 'EmpNo', 'Emp ID']),
          Verification_no: getString(['Verification_no', 'Verification No', 'Verification']),
          Surname: getString(['Surname', 'LastName', 'Last Name']),
          FirstName: getString(['First Name', 'FirstName']),
          MiddleName: getString(['Middle Name', 'MiddleName']),
          GradeStep: getString(['Grade/Step', 'Grade Step', 'GradeStep', 'Grade']),
          MDA: MDA,
          MONTHLY_PAY: getNumber(['MONTHLY_PAY', 'Monthly Pay', 'MONTHLY PAY', 'Salary', 'PAY'])
        };

        // skip rows without a verification id
        if (!record.Verification_no) continue;

        employeeRecords.push(record);
      }

      return employeeRecords;
    } catch (error) {
      console.error(`❌ Error reading file ${filePath}:`, error);
      return [];
    }
  }

  private extractData(records: EmployeeRecord[]): ExtractedEmployee[] {
    return records.map(record => ({
      firstname: `${record.FirstName} ${record.MiddleName || ''}`.trim(),
      lastname: (record.Surname || '').trim(),
      email: null,
      phone: null,
      level: record.GradeStep || '',
      employee_id: record.EmploymentNumber,
      verification_id: record.Verification_no,
      government_entity: record.MDA || '',
      salary_per_month: record.MONTHLY_PAY || 0
    }));
  }

  private escapeCSVCell(value: string): string {
    // escape double quotes and wrap in quotes if contains comma, quote or newline
    const needsQuotes = /[",\r\n]/.test(value);
    const escaped = value.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  }

  private writeToCSV(extractedData: ExtractedEmployee[], csvPath: string): void {
    const headers = [
      'firstname',
      'lastname',
      'email',
      'phone',
      'level',
      'employee_id',
      'verification_id',
      'government_entity',
      'salary_per_month'
    ];

    const csvRows: string[] = [];
    csvRows.push(headers.join(','));

    for (const employee of extractedData) {
      const row = headers.map(header => {
        const value = employee[header as keyof ExtractedEmployee];
        if (value === null || value === undefined) return '';
        return this.escapeCSVCell(String(value));
      });
      csvRows.push(row.join(','));
    }

    fs.mkdirSync(path.dirname(csvPath), { recursive: true });
    fs.writeFileSync(csvPath, csvRows.join('\n'), { encoding: 'utf8' });
    console.log(`✅ CSV saved: ${csvPath} (records: ${extractedData.length})`);
  }

  public processFiles(): void {
    try {
      const files = fs.readdirSync(this.inputDirectory);
      const excelFiles = files.filter(file =>
        file.toLowerCase().endsWith('.xlsx') || file.toLowerCase().endsWith('.xls')
      );

      if (excelFiles.length === 0) {
        console.log('ℹ️ No Excel files found in the directory:', this.inputDirectory);
        return;
      }

      console.log(`📂 Found ${excelFiles.length} Excel file(s) to process`);

      for (const file of excelFiles) {
        const filePath = path.join(this.inputDirectory, file);
        console.log(`\n🔄 Processing file: ${file}`);

        const records = this.readExcelFile(filePath);
        const extractedData = this.extractData(records);

        if (extractedData.length === 0) {
          console.log(`⚠️ No valid records extracted from ${file}`);
          continue;
        }

        const baseName = path.parse(file).name;
        const csvFilePath = path.join(this.outputDirectory, `${baseName}.csv`);
        this.writeToCSV(extractedData, csvFilePath);

        console.log(`✅ Processed ${records.length} records from ${file}`);
      }
    } catch (error) {
      console.error('❌ Error processing files:', error);
    }
  }
}

// 🧠 Usage Example
const inputDir = path.resolve(__dirname, '../../public/civil_servants_2/input');
const outputDir = path.resolve(__dirname, '../../public/civil_servants_2/output');

const extractor = new EmployeeDataExtractor(inputDir, outputDir);
extractor.processFiles();
