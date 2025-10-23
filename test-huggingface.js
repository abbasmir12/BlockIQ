/**
 * Test script for Hugging Face AI integration
 */

import { HuggingFaceAIIntegration } from './src/lib/huggingface-ai-integration.js';

async function testHuggingFaceIntegration() {
  console.log('🧪 Testing Hugging Face AI Integration...');
  
  // Mock wallet data for testing
  const mockWalletData = {
    address: 'ST2QKZ4FKHAH1NQKYKYAYZPY440FEPK7GZ1R5HBP2',
    totalTransactions: 16341,
    transactions: []
  };

  // Test API key (you would need to provide a real one)
  const testApiKey = 'hf_test_key_here';
  const testModel = 'meta-llama/Llama-3.1-8B-Instruct';

  try {
    // Test 1: Initialize MCP tools
    console.log('\n📋 Test 1: Initialize MCP tools');
    const tools = await HuggingFaceAIIntegration.initializeMCPTools();
    console.log(`✅ Initialized ${Object.keys(tools).length} MCP tools`);
    console.log('Available tools:', Object.keys(tools));

    // Test 2: Test integration (without real API key)
    console.log('\n📋 Test 2: Test integration setup');
    try {
      const testResult = await HuggingFaceAIIntegration.testIntegration(testApiKey, testModel);
      console.log('Integration test result:', testResult);
    } catch (error) {
      console.log('⚠️ Integration test failed (expected without real API key):', error.message);
    }

    console.log('\n✅ Hugging Face AI Integration tests completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Configure a real Hugging Face API key in the UI');
    console.log('2. Select Hugging Face as your provider');
    console.log('3. Choose from the available models');
    console.log('4. Test with real blockchain queries');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testHuggingFaceIntegration().catch(console.error);