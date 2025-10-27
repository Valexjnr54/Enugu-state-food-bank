import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

interface EmployeeRecord {
  EmploymentNumber: string;
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
  employee_id: string;
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

  private getHeaderIndex(headers: string[], possibleNames: string[] | string): number {
    const names = Array.isArray(possibleNames) ? possibleNames : [possibleNames];
    // try exact match first
    for (const name of names) {
      const idx = headers.indexOf(name);
      if (idx !== -1) return idx;
    }
    // then case-insensitive trimmed match
    const normalizedHeaders = headers.map(h => String(h || '').trim().toLowerCase());
    for (const name of names) {
      const idx = normalizedHeaders.indexOf(String(name || '').trim().toLowerCase());
      if (idx !== -1) return idx;
    }
    return -1;
  }

  private readExcelFile(filePath: string): EmployeeRecord[] {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      if (!Array.isArray(data) || data.length < 1) {
        console.warn(`File ${filePath} has no data`);
        return [];
      }

      const headers = (data[0] as any[]).map(h => (h === undefined || h === null) ? '' : String(h));
      const rows = data.slice(1);

      const employeeRecords: EmployeeRecord[] = [];

      for (const row of rows) {
        if (!Array.isArray(row) || row.length === 0) continue;

        const getString = (possibleHeaders: string[] | string) => {
          const idx = this.getHeaderIndex(headers, possibleHeaders);
          return idx !== -1 && row[idx] !== undefined && row[idx] !== null ? String(row[idx]).trim() : '';
        };

        const getNumber = (possibleHeaders: string[] | string) => {
          const idx = this.getHeaderIndex(headers, possibleHeaders);
          if (idx === -1 || row[idx] === undefined || row[idx] === null) return 0;
          const val = row[idx];
          if (typeof val === 'number') return val;
          const num = parseFloat(String(val).replace(/[^\d.-]/g, ''));
          return isNaN(num) ? 0 : num;
        };

        const record: EmployeeRecord = {
          EmploymentNumber: getString(['EmploymentNumber', 'Employment Number', 'EmpNo', 'Emp ID']),
          Verification_no: getString(['Verification_no', 'Verification no', 'Verification No', 'Verification']),
          Surname: getString(['Surname', 'LastName', 'Last Name', 'Lastname']),
          FirstName: getString(['First Name', 'FirstName', 'Firstname', 'GivenName']),
          MiddleName: getString(['Middle Name', 'MiddleName', 'Middlename']),
          GradeStep: getString(['Grade/Step', 'Grade Step', 'GradeStep', 'Grade']),
          MDA: getString(['MDA', 'Agency', 'Department']),
          MONTHLY_PAY: getNumber(['MONTHLY_PAY', 'Monthly Pay', 'MONTHLY PAY', 'Salary', 'PAY'])
        };

        employeeRecords.push(record);
      }

      return employeeRecords;
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return [];
    }
  }

  private extractData(records: EmployeeRecord[]): ExtractedEmployee[] {
    return records.map(record => ({
      firstname: `${record.FirstName} ${record.MiddleName}`.trim(),
      lastname: record.Surname.trim(),
      email: null,
      phone: null,
      level: record.GradeStep,
      employee_id: record.EmploymentNumber,
      verification_id: record.Verification_no,
      government_entity: record.MDA,
      salary_per_month: record.MONTHLY_PAY
    }));
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
        if (typeof value === 'string') {
          // remove newlines and quotes to keep CSV simple
          return String(value).replace(/"/g, '').replace(/\r?\n/g, ' ');
        }
        return String(value);
      });
      csvRows.push(row.join(','));
    }

    fs.mkdirSync(path.dirname(csvPath), { recursive: true });
    fs.writeFileSync(csvPath, csvRows.join('\n'), { encoding: 'utf8' });
    console.log(`CSV saved: ${csvPath} (records: ${extractedData.length})`);
  }

  public processFiles(): void {
    try {
      const files = fs.readdirSync(this.inputDirectory);
      const excelFiles = files.filter(file =>
        file.toLowerCase().endsWith('.xlsx') || file.toLowerCase().endsWith('.xls')
      );

      if (excelFiles.length === 0) {
        console.log('No Excel files found in the directory:', this.inputDirectory);
        return;
      }

      console.log(`Found ${excelFiles.length} Excel file(s) to process`);

      for (const file of excelFiles) {
        const filePath = path.join(this.inputDirectory, file);
        console.log(`Processing file: ${file}`);

        const records = this.readExcelFile(filePath);
        const extractedData = this.extractData(records);

        const baseName = path.parse(file).name;
        const csvFilePath = path.join(this.outputDirectory, `${baseName}.csv`);
        this.writeToCSV(extractedData, csvFilePath);

        console.log(`Processed ${records.length} records from ${file}`);
      }
    } catch (error) {
      console.error('Error processing files:', error);
    }
  }
}

// Usage
const inputDir = path.resolve(__dirname, '../../public/civil_servants_2/input');
const outputDir = path.resolve(__dirname, '../../public/civil_servants_2/output'); // separate CSVs per Excel file

const extractor = new EmployeeDataExtractor(inputDir, outputDir);
extractor.processFiles();