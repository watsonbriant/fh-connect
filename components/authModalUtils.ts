export const ANIMATION_DURATION_MS = 200;
export const POST_AUTH_REDIRECT = "/fhconnect/profile";
export const AUTH_TIMEOUT_MS = 30000;
export const REGISTER_FORGOT_TIMEOUT_MS = 20000;

/** Reject after ms. Use with Promise.race so auth calls never hang indefinitely. */
export function timeoutReject<T>(ms: number, message: string): Promise<T> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(message)), ms)
  );
}
