import { RegistrationRow, SeatHold } from './courses';
import { supabase } from './supabase';
import fs from 'fs';
import path from 'path';

export interface MasterStudent {
  regNo: string;
  name: string;
  email: string;
}

const MASTER_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTAHfkezxz7xqAPI2lKn_bss6dhvStfRbMoSCviq43O4U_12qnuecxc-ovkRyKTGBtBzryWvBKfuE7B/pub?output=csv';

let cachedMasterStudents: MasterStudent[] | null = null;
let lastMasterFetch = 0;
const CACHE_TTL = 30 * 1000; // 30 seconds

// Local persistent file paths as durable fallback/backup
const DATA_DIR = path.join(process.cwd(), 'data');
const REGISTRATIONS_FILE = path.join(DATA_DIR, 'registrations.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error("Failed to create data directory:", err);
  }
}

function loadLocalRegistrations(): RegistrationRow[] {
  try {
    ensureDataDir();
    if (fs.existsSync(REGISTRATIONS_FILE)) {
      const data = fs.readFileSync(REGISTRATIONS_FILE, 'utf-8');
      return JSON.parse(data) || [];
    }
  } catch (err) {
    console.error("Failed to read local registrations file:", err);
  }
  return [];
}

function saveLocalRegistrations(rows: RegistrationRow[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify(rows, null, 2), 'utf-8');
  } catch (err) {
    console.error("Failed to save local registrations file:", err);
  }
}

// In-memory registration store pre-loaded from local file
let inMemoryRegistrations: RegistrationRow[] = loadLocalRegistrations();

/**
 * Resets local in-memory and file-based registration cache
 */
export function clearRegistrationsCache(): void {
  inMemoryRegistrations = [];
  try {
    ensureDataDir();
    if (fs.existsSync(REGISTRATIONS_FILE)) {
      fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify([]), 'utf-8');
    }
  } catch (err) {
    console.error("Failed to wipe local registrations file:", err);
  }
}

/**
 * Registration Open/Closed System Settings Management
 */
let inMemoryRegistrationOpen = true;

export async function getRegistrationStatus(): Promise<boolean> {
  // 1. Try reading from Supabase system_settings table
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'registration_open')
      .maybeSingle();

    if (!error && data) {
      const isOpen = data.value === 'true' || data.value === true;
      inMemoryRegistrationOpen = isOpen;
      saveLocalSettings({ registration_open: isOpen });
      return isOpen;
    }
  } catch (err) {
    // Fallback to local settings file
  }

  // 2. Try reading from local settings.json
  try {
    ensureDataDir();
    if (fs.existsSync(SETTINGS_FILE)) {
      const content = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const settings = JSON.parse(content);
      if (typeof settings.registration_open === 'boolean') {
        inMemoryRegistrationOpen = settings.registration_open;
        return settings.registration_open;
      }
    }
  } catch (err) {
    // Fallback to memory state
  }

  return inMemoryRegistrationOpen;
}

export async function setRegistrationStatus(isOpen: boolean): Promise<boolean> {
  inMemoryRegistrationOpen = isOpen;
  saveLocalSettings({ registration_open: isOpen });

  // Update Supabase system_settings table if available
  try {
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        key: 'registration_open',
        value: isOpen ? 'true' : 'false',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' });

    if (error) {
      console.warn("Could not update system_settings in Supabase:", error.message);
    }
  } catch (err) {
    console.warn("Supabase settings upsert exception:", err);
  }

  return isOpen;
}

function saveLocalSettings(newSettings: Record<string, any>): void {
  try {
    ensureDataDir();
    let currentSettings: Record<string, any> = {};
    if (fs.existsSync(SETTINGS_FILE)) {
      try {
        currentSettings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
      } catch (e) {}
    }
    const updated = { ...currentSettings, ...newSettings };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error("Failed to save local settings file:", err);
  }
}

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
 * Reads Registrations from Supabase database (or fallback durable file/memory store)
 */
export async function fetchRegistrations(): Promise<RegistrationRow[]> {
  const localRows = loadLocalRegistrations();
  const registrationMap = new Map<string, RegistrationRow>();

  // 1. Populate from local durable JSON file store
  for (const row of localRows) {
    if (row.email) {
      registrationMap.set(row.email.toLowerCase(), row);
    }
  }

  // 2. Fetch from Supabase and merge
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*');

    if (!error && data && data.length > 0) {
      for (const row of data) {
        const email = (row.email || '').toLowerCase();
        if (email) {
          registrationMap.set(email, {
            regNo: row.reg_no || row.regNo || '',
            name: row.name || '',
            email,
            s1Sports: row.s1_sports || row.s1Sports || '',
            s1StudentLife: row.s1_student_life || row.s1StudentLife || '',
            s2Sports: row.s2_sports || row.s2Sports || '',
            s2StudentLife: row.s2_student_life || row.s2StudentLife || '',
            timestamp: row.timestamp || new Date().toISOString(),
            status: row.status || 'CONFIRMED',
          });
        }
      }
    }
  } catch (err) {
    console.warn("Supabase registrations query error, using local store fallback:", err);
  }

  const mergedRows = Array.from(registrationMap.values());
  inMemoryRegistrations = mergedRows;
  saveLocalRegistrations(mergedRows);
  return mergedRows;
}

/**
 * Upserts a registration entry to Supabase database, in-memory cache, and local JSON backup file
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

  // Save to durable local JSON file backup
  saveLocalRegistrations(inMemoryRegistrations);

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

  // Remove active draft seat hold since registration is confirmed
  deleteSeatHold(normalizedEmail);
}

const SEAT_HOLDS_FILE = path.join(DATA_DIR, 'seat_holds.json');
let inMemorySeatHolds: SeatHold[] = [];

function loadLocalSeatHolds(): SeatHold[] {
  try {
    ensureDataDir();
    if (fs.existsSync(SEAT_HOLDS_FILE)) {
      const content = fs.readFileSync(SEAT_HOLDS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Failed to load local seat_holds.json:", err);
  }
  return [];
}

function saveLocalSeatHolds(holds: SeatHold[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(SEAT_HOLDS_FILE, JSON.stringify(holds, null, 2), 'utf-8');
  } catch (err) {
    console.error("Failed to save local seat_holds.json:", err);
  }
}

export function fetchActiveSeatHolds(): SeatHold[] {
  if (inMemorySeatHolds.length === 0) {
    inMemorySeatHolds = loadLocalSeatHolds();
  }
  const now = Date.now();
  const TEN_MINUTES_MS = 10 * 60 * 1000;
  // Filter out holds older than 10 minutes
  inMemorySeatHolds = inMemorySeatHolds.filter(h => now - h.updatedAt < TEN_MINUTES_MS);
  saveLocalSeatHolds(inMemorySeatHolds);
  return inMemorySeatHolds;
}

export function upsertSeatHold(
  email: string,
  choices: { s1Sports?: string; s1StudentLife?: string; s2Sports?: string; s2StudentLife?: string }
): SeatHold[] {
  const normalizedEmail = email.toLowerCase();
  fetchActiveSeatHolds();

  const index = inMemorySeatHolds.findIndex(h => h.email.toLowerCase() === normalizedEmail);
  const existing = index >= 0 ? inMemorySeatHolds[index] : { email: normalizedEmail, updatedAt: Date.now() };

  const updatedHold: SeatHold = {
    ...existing,
    ...choices,
    email: normalizedEmail,
    updatedAt: Date.now(),
  };

  if (index >= 0) {
    inMemorySeatHolds[index] = updatedHold;
  } else {
    inMemorySeatHolds.push(updatedHold);
  }

  saveLocalSeatHolds(inMemorySeatHolds);
  return inMemorySeatHolds;
}

export function deleteSeatHold(email: string): void {
  const normalizedEmail = email.toLowerCase();
  fetchActiveSeatHolds();
  inMemorySeatHolds = inMemorySeatHolds.filter(h => h.email.toLowerCase() !== normalizedEmail);
  saveLocalSeatHolds(inMemorySeatHolds);
}

