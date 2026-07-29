import { RegistrationRow } from './courses';

export interface MasterStudent {
  regNo: string;
  name: string;
  email: string;
}

const MASTER_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTAHfkezxz7xqAPI2lKn_bss6dhvStfRbMoSCviq43O4U_12qnuecxc-ovkRyKTGBtBzryWvBKfuE7B/pub?output=csv';

let cachedMasterStudents: MasterStudent[] | null = null;
let lastMasterFetch = 0;
const CACHE_TTL = 30 * 1000; // 30 seconds

// In-memory registration store as local fallback/cache for serverless execution
let inMemoryRegistrations: RegistrationRow[] = [];

/**
 * Reads Master Students from Google Sheets CSV
 */
export async function fetchMasterStudents(): Promise<MasterStudent[]> {
  if (cachedMasterStudents && Date.now() - lastMasterFetch < CACHE_TTL) {
    return cachedMasterStudents;
  }

  try {
    const res = await fetch(MASTER_CSV_URL, { cache: 'no-store' });
    const text = await res.text();

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const students: MasterStudent[] = lines.slice(1).map(line => {
      const parts = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
      return {
        regNo: parts[0] || '',
        name: parts[1] || '',
        email: (parts[2] || '').toLowerCase(),
      };
    });

    cachedMasterStudents = students;
    lastMasterFetch = Date.now();
    return students;
  } catch (err) {
    console.error("Failed to fetch Master Students from Google Sheets CSV:", err);
    return cachedMasterStudents || [];
  }
}

export async function checkStudentAuthorized(email: string): Promise<MasterStudent | null> {
  const students = await fetchMasterStudents();
  return students.find(s => s.email === email.toLowerCase()) || null;
}

/**
 * Reads Registrations (Source of Truth)
 */
export async function fetchRegistrations(): Promise<RegistrationRow[]> {
  return inMemoryRegistrations;
}

/**
 * Upserts a registration entry so every student appears at most ONCE.
 */
export async function upsertRegistration(entry: RegistrationRow): Promise<void> {
  const normalizedEmail = entry.email.toLowerCase();
  const existingIndex = inMemoryRegistrations.findIndex(r => r.email.toLowerCase() === normalizedEmail);

  if (existingIndex >= 0) {
    // Update existing student row in-place
    inMemoryRegistrations[existingIndex] = {
      ...inMemoryRegistrations[existingIndex],
      s1Sports: entry.s1Sports,
      s1StudentLife: entry.s1StudentLife,
      s2Sports: entry.s2Sports,
      s2StudentLife: entry.s2StudentLife,
      timestamp: entry.timestamp,
      status: entry.status,
    };
  } else {
    // Append new student registration row
    inMemoryRegistrations.push({
      ...entry,
      email: normalizedEmail,
    });
  }
}
