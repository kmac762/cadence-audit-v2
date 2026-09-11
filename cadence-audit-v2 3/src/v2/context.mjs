import { AsyncLocalStorage } from 'node:async_hooks';
export const scanContext = new AsyncLocalStorage();
export function context() { return scanContext.getStore() || {}; }
export function remainingMs(defaultMs = 10000) {
  const left = (context().deadline || Infinity) - Date.now();
  if (left < 50) throw Object.assign(new Error('The scan time budget has been reached.'), { code:'SCAN_DEADLINE' });
  return Math.max(50, Math.min(defaultMs, left));
}
