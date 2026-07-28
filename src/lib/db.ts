import fs from 'fs';
import path from 'path';

// This is a mock implementation of Google Sheets integration.
// It stores data in a local JSON file to persist during development.

const DB_FILE = path.join(process.cwd(), 'mock-db.json');

export interface Student {
  regNo: string;
  name: string;
  email: string;
}

export interface Registration {
  regNo: string;
  name: string;
  email: string;
  s1Sports: string;
  s1StudentLife: string;
  s2Sports: string;
  s2StudentLife: string;
  timestamp: string;
}

interface DbSchema {
  students: Student[];
  registrations: Registration[];
}

const defaultDb: DbSchema = {
  students: [
    { regNo: 'REG001', name: 'Alice Smith', email: 'alice@example.com' },
    { regNo: 'REG002', name: 'Bob Jones', email: 'bob@example.com' },
    { regNo: 'REG003', name: 'Charlie Brown', email: 'charlie@example.com' },
    // Admin for testing
    { regNo: 'ADMIN', name: 'Admin User', email: 'jriteshreddy@gmail.com' }
  ],
  registrations: []
};

// Initialize DB file if not exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2));
}

function readDb(): DbSchema {
  const data = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(data);
}

function writeDb(data: DbSchema) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTAHfkezxz7xqAPI2lKn_bss6dhvStfRbMoSCviq43O4U_12qnuecxc-ovkRyKTGBtBzryWvBKfuE7B/pub?output=csv';

let cachedStudents: Student[] | null = null;

async function fetchStudentsFromCSV(): Promise<Student[]> {
  if (cachedStudents) return cachedStudents;

  try {
    const res = await fetch(CSV_URL);
    const text = await res.text();
    
    // Parse CSV (simple split, assuming no commas inside values for this basic dataset)
    const lines = text.split('\\n').map(l => l.trim()).filter(l => l.length > 0);
    // Skip header
    const students: Student[] = lines.slice(1).map(line => {
      const [regNo, name, email] = line.split(',');
      return { regNo, name, email };
    });

    cachedStudents = students;
    return students;
  } catch (error) {
    console.error("Failed to fetch CSV:", error);
    return [];
  }
}

export async function checkEmailExists(email: string): Promise<Student | null> {
  const students = await fetchStudentsFromCSV();
  const student = students.find(s => s.email?.toLowerCase() === email.toLowerCase());
  return student || null;
}

export async function getRegistrations(): Promise<Registration[]> {
  const db = readDb();
  return db.registrations;
}

export async function getStudentRegistration(email: string): Promise<Registration | null> {
  const db = readDb();
  const reg = db.registrations.find(r => r.email.toLowerCase() === email.toLowerCase());
  return reg || null;
}

export async function saveRegistration(reg: Registration): Promise<boolean> {
  const db = readDb();
  
  // Check if already registered
  if (db.registrations.some(r => r.email === reg.email)) {
    throw new Error("Student already registered");
  }
  
  db.registrations.push(reg);
  writeDb(db);
  return true;
}
