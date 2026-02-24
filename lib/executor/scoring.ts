export function calculateScore(results: { passed: boolean }[]) {
    const total = results.length;
    const passed = results.filter(r => r.passed).length;
  
    const percentage = total === 0 ? 0 : Math.round((passed / total) * 100);
  
    return {
      passed,
      total,
      percentage,
    };
  }
  