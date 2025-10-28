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

   private cleanMDA(value: string): string {
    if (!value) return '';
    let s = String(value).replace(/\u00A0/g, ' ').trim();
    // ensure month words attached to words are separated (e.g. "PRESSSeptember2025" -> "PRESS September 2025")
    s = s.replace(/([A-Za-z])(?=(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?))/ig, '$1 ');
    // remove month names
    s = s.replace(/\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/ig, '');
    // remove 4-digit years and simple date fragments like "01-2025" or "2025/01"
    s = s.replace(/\b(19|20)\d{2}\b/g, '').replace(/\b\d{1,2}[-\/]\d{2,4}\b/g, '');
    // remove standalone digits and common separators leftover
    s = s.replace(/[_\-.]/g, ' ').replace(/\d+/g, '');
    // collapse spaces, trim, and return
    return s.replace(/\s+/g, ' ').trim();
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

  // New helper: parse currency-like strings (e.g. "N129,890.18", "₦ 129,890.18", "(N129,890.18)")
  private parseCurrency(value: unknown): number {
    if (value === undefined || value === null) return 0;
    let s = String(value).replace(/\u00A0/g, ' ').trim(); // normalize NBSP

    // detect parentheses representing negative values: "(N129,890.18)" -> negative
    const isParensNegative = /^\(.*\)$/.test(s);
    if (isParensNegative) s = s.replace(/^\(|\)$/g, '').trim();

    // remove common currency symbols/letters and any non-digit, non-separator characters except - . , and spaces
    s = s.replace(/[\u20A6\u00A3\u0024\u20AC\u00A5₦£$€¥]/g, ''); // common currency symbols
    s = s.replace(/[A-Za-z\u2013\u2014]/g, ''); // remove letters and dashes
    s = s.replace(/[^0-9.,\-\s]/g, '').trim();

    // find the first numeric-like sequence
    const match = s.match(/-?\d{1,3}(?:[,\s]\d{3})*(?:\.\d+)?|-?\d+(?:\.\d+)?/);
    if (!match) return 0;
    const numStr = match[0].replace(/[,\s]/g, ''); // remove thousand separators/spaces
    const n = parseFloat(numStr);
    const result = Number.isFinite(n) ? n : 0;
    return isParensNegative ? -Math.abs(result) : result;
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

      // 2️⃣ Extract Department (MDA) from file name (preferred) — fallback to scanning lines above header
      let MDA = '';
      try {
        const fileBase = path.parse(filePath).name || '';
        // convert common separators to spaces and normalize
        const fileBaseNormalized = fileBase.replace(/[_\-.]+/g, ' ').replace(/\s+/g, ' ').trim();
        MDA = this.cleanMDA(fileBaseNormalized);
      } catch (e) {
        MDA = '';
      }
      
      // If filename is empty or generic, fallback to scanning lines above header
      if (!MDA || /^(input|output|data|sheet|file)$/i.test(MDA)) {
        for (let i = headerRowIndex - 1; i >= 0; i--) {
          const line = Array.isArray(data[i]) ? data[i].join(' ') : String(data[i] || '');
          const match = line.match(/department[:\s-]*([\w\s().\/&-]+)/i);
          if (match && match[1]) {
            MDA = this.cleanMDA(match[1].trim());
            break;
          }
          // fallback: if a non-empty line that doesn't look like header, use it
          if (!MDA && line.trim()) {
            // keep scanning upward but remember a candidate (don't break immediately)
            MDA = this.cleanMDA(line.trim());
          }
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

        const net_pay = getString(['Net Pay', 'Net_Pay', 'NetPay']);
        // skip rows that look like summary lines
        if (net_pay.toLowerCase().includes('total') || net_pay.toLowerCase().includes('count')) {
          continue;
        }

        const netPay = this.parseCurrency(net_pay);
        if (netPay === 0) {
          // likely a non-data row
          continue;
        }

        const record: EmployeeRecord = {
          EmploymentNumber: getNullableString(['EmploymentNumber', 'Employment Number', 'EmpNo', 'Emp ID']),
          Verification_no: getString(['Verification_no', 'Verification No', 'Verification']),
          Surname: getString(['Surname', 'LastName', 'Last Name']),
          FirstName: getString(['First Name', 'FirstName']),
          MiddleName: getString(['Middle Name', 'MiddleName']),
          GradeStep: getString(['Grade/Step', 'Grade Step', 'GradeStep', 'Grade']),
          MDA: MDA,
          MONTHLY_PAY: netPay
        };

        // skip rows without a verification id
        if (!record.Verification_no) continue;

        // normalize a few fields for heuristics
        const vNorm = this.normalize(record.Verification_no);
        const fNorm = this.normalize(record.FirstName);
        const sNorm = this.normalize(record.Surname);
        const gNorm = this.normalize(record.GradeStep);

        // skip rows that look like repeated headers or summary/count lines
        if (
          vNorm.includes('verification') || // e.g. "Verification No" header row repeated
          fNorm.includes('first name') ||   // e.g. "First Name Middle Name" header row
          sNorm.includes('surname') ||      // e.g. "Surname" header row
          gNorm.includes('grade') ||        // e.g. "Grade/Step" header row
          vNorm.startsWith('count') ||      // e.g. "Count: 72" summary lines
          vNorm.includes('count:') 
        ) {
          continue;
        }

        // skip rows where firstname is empty (per request)
        if (!record.FirstName || record.FirstName.trim() === '') continue;
 
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
      // ensure month/year fragments are removed from MDA before emitting
      government_entity: this.cleanMDA(record.MDA || ''),
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
        // Emit salary_per_month as a plain numeric value (no quoting) to ensure CSV contains a number
        if (header === 'salary_per_month') {
          // ensure numeric output and avoid quoting
          return typeof value === 'number' ? String(value) : this.escapeCSVCell(String(value));
        }
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
