export const EXECUTION_LIMITS = {
  TIMEOUT_MS: 3000,
  MAX_OUTPUT: 10000,
};

export function clampOutput(output: string) {
  return output.slice(0, EXECUTION_LIMITS.MAX_OUTPUT);
}
