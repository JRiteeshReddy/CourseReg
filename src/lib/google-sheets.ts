import { RegistrationRow } from './courses';
import { supabase } from './supabase';

export interface MasterStudent {
  regNo: string;
  name: string;
  email: string;
}

const MASTER_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTAHfkezxz7xqAPI2lKn_bss6dhvStfRbMoSCviq43O4U_12qnuecxc-ovkRyKTGBtBzryWvBKfuE7B/pub?output=csv';

let cachedMasterStudents: MasterStudent[] | null = null;
let lastMasterFetch = 0;
const CACHE_TTL = 30 * 1000; // 30 seconds

// In-memory registration store as local fallback/cache
let inMemoryRegistrations: RegistrationRow[] = [];

/**
 * Reads Master Students from Supabase table or Google Sheets CSV fallback
 */
export async function fetchMasterStudents(): Promise<MasterStudent[]> {
  if (cachedMasterStudents && Date.now() - lastMasterFetch < CACHE_TTL) {
    return cachedMasterStudents;
  }

  // 1. Attempt Supabase fetch
  try {
    const { data, error } = await supabase.from('master_students').select('*');
    if (!error && data && data.length > 0) {
      const students: MasterStudent[] = data.map((row: any) => ({
        regNo: row.reg_no || row.regNo || '',
        name: row.name || '',
        email: (row.email || '').toLowerCase(),
      }));

      cachedMasterStudents = students;
      lastMasterFetch = Date.now();
      return students;
    }
  } catch (err) {
    console.warn("Supabase master_students query fallback to Google Sheets CSV:", err);
  }

  // 2. Fallback to Google Sheets CSV
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
  const normalizedEmail = email.toLowerCase();

  // Try direct Supabase lookup first
  try {
    const { data, error } = await supabase
      .from('master_students')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (!error && data) {
      return {
        regNo: data.reg_no || data.regNo || '',
        name: data.name || '',
        email: (data.email || '').toLowerCase(),
      };
    }
  } catch (err) {
    // Fallback to fetchMasterStudents list search
  }

  const students = await fetchMasterStudents();
  return students.find(s => s.email === normalizedEmail) || null;
}

/**
 * Reads Registrations from Supabase database (or fallback in-memory cache)
 */
export async function fetchRegistrations(): Promise<RegistrationRow[]> {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*');

    if (!error && data) {
      const rows: RegistrationRow[] = data.map((row: any) => ({
        regNo: row.reg_no || row.regNo || '',
        name: row.name || '',
        email: (row.email || '').toLowerCase(),
        s1Sports: row.s1_sports || row.s1Sports || '',
        s1StudentLife: row.s1_student_life || row.s1StudentLife || '',
        s2Sports: row.s2_sports || row.s2Sports || '',
        s2StudentLife: row.s2_student_life || row.s2StudentLife || '',
        timestamp: row.timestamp || new Date().toISOString(),
        status: row.status || 'CONFIRMED',
      }));

      inMemoryRegistrations = rows;
      return rows;
    }
  } catch (err) {
    console.warn("Supabase registrations query error, falling back to memory:", err);
  }

  return inMemoryRegistrations;
}

/**
 * Upserts a registration entry to Supabase database (and local cache)
 */
export async function upsertRegistration(entry: RegistrationRow): Promise<void> {
  const normalizedEmail = entry.email.toLowerCase();

  // Update in-memory fallback cache
  const existingIndex = inMemoryRegistrations.findIndex(r => r.email.toLowerCase() === normalizedEmail);
  if (existingIndex >= 0) {
    inMemoryRegistrations[existingIndex] = { ...entry, email: normalizedEmail };
  } else {
    inMemoryRegistrations.push({ ...entry, email: normalizedEmail });
  }

  // Upsert to Supabase
  try {
    const { error } = await supabase
      .from('registrations')
      .upsert({
        email: normalizedEmail,
        reg_no: entry.regNo,
        name: entry.name,
        s1_sports: entry.s1Sports,
        s1_student_life: entry.s1StudentLife,
        s2_sports: entry.s2Sports,
        s2_student_life: entry.s2StudentLife,
        timestamp: entry.timestamp,
        status: entry.status || 'CONFIRMED',
      }, { onConflict: 'email' });

    if (error) {
      console.error("Failed to upsert registration in Supabase:", error.message);
    }
  } catch (err) {
    console.error("Supabase upsert exception:", err);
  }
}
