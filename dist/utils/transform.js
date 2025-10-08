"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const xlsx = __importStar(require("xlsx"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
function extractRows(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json = xlsx.utils.sheet_to_json(sheet);
    return json.map((row) => ({
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
    const allRows = [];
    for (const file of excelFiles) {
        const filePath = path.join(inputDir, file);
        const rows = extractRows(filePath);
        allRows.push(...rows);
    }
    const csv = [
        'firstname,lastname,email,phone,level,employee_id,verification_id,government_entity,salary_per_month',
        ...allRows.map(r => [
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
            if (i === 8)
                return v; // salary_per_month (float, no quotes)
            return v === null ? '' : `"${v}"`;
        }).join(',')),
    ].join('\n');
    await fs.ensureDir(path.dirname(outputFile));
    await fs.writeFile(outputFile, csv, 'utf8');
    console.log(`✅ CSV written to ${outputFile}`);
}
main().catch(console.error);
