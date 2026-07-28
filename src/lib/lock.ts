// Simple in-memory mutex lock for single-server deployment
class Mutex {
  private locked = false;
  private queue: Array<() => void> = [];

  async lock(): Promise<void> {
    return new Promise(resolve => {
      if (!this.locked) {
        this.locked = true;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  }

  unlock(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) next();
    } else {
      this.locked = false;
    }
  }
}

// Global instance to survive HMR in dev, though not fully guaranteed in serverless
const globalForLock = globalThis as unknown as {
  registrationMutex: Mutex;
};

export const registrationMutex = globalForLock.registrationMutex || new Mutex();
if (process.env.NODE_ENV !== 'production') {
  globalForLock.registrationMutex = registrationMutex;
}
