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
  email: null;
  phone: null;
  level: string;
  employee_id: string;
  verification_id: string;
  government_entity: string;
  salary_per_month: number;
}

class EmployeeDataExtractor {
  private inputDirectory: string;
  private outputFile: string;

  constructor(inputDirectory: string, outputFile: string) {
    this.inputDirectory = inputDirectory;
    this.outputFile = outputFile;
  }

  private readExcelFile(filePath: string): EmployeeRecord[] {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with proper header mapping
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (data.length < 2) {
        console.warn(`File ${filePath} has no data rows`);
        return [];
      }

      const headers = data[0] as string[];
      const rows = data.slice(1);
      
      const employeeRecords: EmployeeRecord[] = [];

      for (const row of rows) {
        if (!Array.isArray(row) || row.length === 0) continue;

        const record: EmployeeRecord = {
          EmploymentNumber: this.getStringValue(row, headers, 'EmploymentNumber'),
          Verification_no: this.getStringValue(row, headers, 'Verification_no'),
          Surname: this.getStringValue(row, headers, 'Surname'),
          FirstName: this.getStringValue(row, headers, 'First Name'),
          MiddleName: this.getStringValue(row, headers, 'Middle Name'),
          GradeStep: this.getStringValue(row, headers, 'Grade/Step'),
          MDA: this.getStringValue(row, headers, 'MDA'),
          MONTHLY_PAY: this.getNumberValue(row, headers, 'MONTHLY_PAY')
        };

        employeeRecords.push(record);
      }

      return employeeRecords;
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return [];
    }
  }

  private getStringValue(row: any[], headers: string[], headerName: string): string {
    const index = headers.indexOf(headerName);
    return index !== -1 && row[index] !== undefined ? String(row[index] || '') : '';
  }

  private getNumberValue(row: any[], headers: string[], headerName: string): number {
    const index = headers.indexOf(headerName);
    if (index === -1 || row[index] === undefined) return 0;
    
    const value = row[index];
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = parseFloat(value.replace(/[^\d.-]/g, ''));
      return isNaN(num) ? 0 : num;
    }
    return 0;
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

  private writeToCSV(extractedData: ExtractedEmployee[]): void {
    if (extractedData.length === 0) {
      console.log('No data to write to CSV');
      return;
    }

    const headers = Object.keys(extractedData[0]);
    const csvRows = [headers.join(',')];

    for (const employee of extractedData) {
      const row = headers.map(header => {
        const value = employee[header as keyof ExtractedEmployee];
        if (value === null) return ''; // Output empty string for null
        if (typeof value === 'string') return value.replace(/"/g, ''); // No quotes, remove any embedded quotes
        return value; // numbers (salary_per_month) output as-is
      });
      csvRows.push(row.join(','));
    }

    fs.writeFileSync(this.outputFile, csvRows.join('\n'));
    console.log(`CSV file created successfully: ${this.outputFile}`);
    console.log(`Total records processed: ${extractedData.length}`);
  }

  public processFiles(): void {
    try {
      const files = fs.readdirSync(this.inputDirectory);
      const excelFiles = files.filter(file => 
        file.endsWith('.xlsx') || file.endsWith('.xls')
      );

      if (excelFiles.length === 0) {
        console.log('No Excel files found in the directory');
        return;
      }

      console.log(`Found ${excelFiles.length} Excel file(s) to process`);

      let allExtractedData: ExtractedEmployee[] = [];

      for (const file of excelFiles) {
        const filePath = path.join(this.inputDirectory, file);
        console.log(`Processing file: ${file}`);
        
        const records = this.readExcelFile(filePath);
        const extractedData = this.extractData(records);
        
        allExtractedData = [...allExtractedData, ...extractedData];
        console.log(`Processed ${records.length} records from ${file}`);
      }

      this.writeToCSV(allExtractedData);

    } catch (error) {
      console.error('Error processing files:', error);
    }
  }
}

// Usage
const inputDir = path.resolve(__dirname, '../../public/civil_servants_2/input'); // Directory containing Excel files
const outputFile = path.resolve(__dirname, '../../public/civil_servants_2/extracted_employee_data.csv');

const extractor = new EmployeeDataExtractor(inputDir, outputFile);
extractor.processFiles();