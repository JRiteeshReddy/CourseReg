import * as fs from 'fs';
import * as path from 'path';

export interface Student {
  regNo: string;
  name: string;
  email: string;
}

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTAHfkezxz7xqAPI2lKn_bss6dhvStfRbMoSCviq43O4U_12qnuecxc-ovkRyKTGBtBzryWvBKfuE7B/pub?output=csv';

let cachedStudents: Student[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchStudentsFromCSV(): Promise<Student[]> {
  if (cachedStudents && Date.now() - lastFetchTime < CACHE_TTL) {
    return cachedStudents;
  }

  try {
    const res = await fetch(CSV_URL);
    const text = await res.text();
    
    // Parse CSV
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    // Skip header row
    const students: Student[] = lines.slice(1).map(line => {
      // Handle potential quoted fields if necessary, but assuming simple comma separated
      const [regNo, name, email] = line.split(',').map(s => s.trim());
      return { regNo, name, email: email?.toLowerCase() };
    });

    cachedStudents = students;
    lastFetchTime = Date.now();
    return students;
  } catch (err) {
    console.error("Failed to fetch Google Sheets CSV:", err);
    return cachedStudents || [];
  }
}

export async function checkEmailExists(email: string): Promise<Student | null> {
  const students = await fetchStudentsFromCSV();
  return students.find(s => s.email === email.toLowerCase()) || null;
}
