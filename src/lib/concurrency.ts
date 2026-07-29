import { Mutex } from 'async-mutex';

// Global server-side mutex to serialize registration requests
// Prevents race conditions during peak simultaneous registrations
const registrationMutex = new Mutex();

export async function runWithRegistrationLock<T>(action: () => Promise<T>): Promise<T> {
  return await registrationMutex.runExclusive(async () => {
    return await action();
  });
}
