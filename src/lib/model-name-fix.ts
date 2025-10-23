/**
 * Model Name Fix Utility
 * 
 * Fixes cached model names that use the old Meta-Llama format
 */

export function fixModelName(modelName: string): string {
  // Fix old Meta-Llama names to correct Llama names
  const fixes: Record<string, string> = {
    'meta-llama/Meta-Llama-3.1-8B-Instruct': 'meta-llama/Llama-3.1-8B-Instruct',
    'meta-llama/Meta-Llama-3.1-70B-Instruct': 'meta-llama/Llama-3.1-70B-Instruct',
    'meta-llama/Meta-Llama-3.2-1B-Instruct': 'meta-llama/Llama-3.2-1B-Instruct',
    'meta-llama/Meta-Llama-3.2-3B-Instruct': 'meta-llama/Llama-3.2-3B-Instruct',
  };

  const correctedName = fixes[modelName] || modelName;
  
  if (fixes[modelName]) {
    console.log(`[Model Fix] 🔧 Corrected model name: ${modelName} → ${correctedName}`);
    
    // Update localStorage if we're in browser environment
    if (typeof window !== 'undefined') {
      const savedModel = localStorage.getItem('ai_model_name');
      const savedAdkModel = localStorage.getItem('adk_model');
      
      if (savedModel === modelName) {
        localStorage.setItem('ai_model_name', correctedName);
        console.log(`[Model Fix] 💾 Updated ai_model_name in localStorage`);
      }
      
      if (savedAdkModel === modelName) {
        localStorage.setItem('adk_model', correctedName);
        console.log(`[Model Fix] 💾 Updated adk_model in localStorage`);
      }
    }
  }
  
  return correctedName;
}

export function clearOldModelCache(): void {
  if (typeof window !== 'undefined') {
    const oldModels = [
      'meta-llama/Meta-Llama-3.1-8B-Instruct',
      'meta-llama/Meta-Llama-3.1-70B-Instruct',
      'meta-llama/Meta-Llama-3.2-1B-Instruct',
      'meta-llama/Meta-Llama-3.2-3B-Instruct',
    ];
    
    const savedModel = localStorage.getItem('ai_model_name');
    const savedAdkModel = localStorage.getItem('adk_model');
    
    if (savedModel && oldModels.includes(savedModel)) {
      localStorage.setItem('ai_model_name', 'meta-llama/Llama-3.1-8B-Instruct');
      console.log(`[Model Fix] 🧹 Cleared old ai_model_name cache`);
    }
    
    if (savedAdkModel && oldModels.includes(savedAdkModel)) {
      localStorage.setItem('adk_model', 'meta-llama/Llama-3.1-8B-Instruct');
      console.log(`[Model Fix] 🧹 Cleared old adk_model cache`);
    }
  }
}