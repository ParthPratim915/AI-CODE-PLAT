export interface ExecuteRequest {
    language: 'javascript';
    code: string;
    tests: { input: string; expected: string }[];
  }
  
  export interface ExecuteResponse {
    results: { passed: boolean }[];
    stdout: string;
    success: boolean;
  }
  