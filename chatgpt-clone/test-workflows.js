const BASE_URL = 'http://localhost:3001/api/workflows';

async function runTests() {
  console.log('🧪 Starting Workflow Tests...\n');

  try {
    // 1. Text
    console.log('--- 1. Testing Text Workflow ---');
    const textRes = await fetch(`${BASE_URL}/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: 'Why is the sky blue? Keep it to one sentence.',
        instructions: 'Answer like a 19th-century pirate.'
      })
    });
    const textData = await textRes.json();
    console.log('Result:', textData);
    console.log('\n');

    // 2. Structured
    console.log('--- 2. Testing Structured Workflow ---');
    const structRes = await fetch(`${BASE_URL}/structured`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: 'Meet ALICE. She is a 32 year old data scientist who loves Python, Pandas, and machine learning.'
      })
    });
    const structData = await structRes.json();
    console.log('Result (Strict JSON):', structData);
    console.log('\n');

    // 3. Tool
    console.log('--- 3. Testing Tool Calling Workflow ---');
    const toolRes = await fetch(`${BASE_URL}/tool`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: 'What is the current weather in Seattle, WA in Fahrenheit?'
      })
    });
    const toolData = await toolRes.json();
    console.log('Result (Expect tool call):', toolData);
    console.log('\n');

    // 4. Multimodal
    console.log('--- 4. Testing Multimodal Workflow ---');
    const mmRes = await fetch(`${BASE_URL}/multimodal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: 'What color is the main element in this placeholder image?',
        imageUrl: 'https://via.placeholder.com/150'
      })
    });
    const mmData = await mmRes.json();
    console.log('Result:', mmData);
    
  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

runTests();
