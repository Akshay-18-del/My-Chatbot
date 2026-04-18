import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

let ai = null;
function getAI() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') throw new Error('Missing GEMINI_API_KEY');
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

function getModel() {
  return process.env.GEMINI_MODEL || "gemini-2.5-flash";
}

/* ─── 1. Text Workflow ────────────────────────────────────────── */
// Generates plain text with system instructions
router.post('/text', async (req, res) => {
  try {
    const { input, instructions } = req.body;
    
    // Instructions equivalent to systemInstruction in Gemini
    const response = await getAI().models.generateContent({
      model: getModel(),
      contents: input || "Hello! Tell me a fun fact about space.",
      config: instructions ? { systemInstruction: instructions } : undefined
    });

    res.json({ 
      output_text: response.text,
      full_response: response
    });
  } catch (error) {
    console.error('[Workflow Error - Text]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/* ─── 2. Structured Output Workflow ────────────────────────────── */
// Forces the model to reply in a strict, predefined JSON schema
router.post('/structured', async (req, res) => {
  try {
    const { input } = req.body;
    
    const response = await getAI().models.generateContent({
      model: getModel(),
      contents: input || "John Doe is a 28 year old software engineer who knows JavaScript, Python, and React.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING", description: "The person's full name" },
            age: { type: "NUMBER", description: "The person's age if mentioned, otherwise 0" },
            skills: { 
              type: "ARRAY", 
              items: { type: "STRING" },
              description: "List of technical or professional skills"
            }
          },
          required: ["name", "age", "skills"]
        }
      }
    });

    res.json({ 
      output_text: response.text, // Contains stringified JSON
      full_response: response
    });
  } catch (error) {
    console.error('[Workflow Error - Structured]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/* ─── 3. Tool Calling Workflow ─────────────────────────────────── */
// Allows the model to determine if it should invoke a tool
router.post('/tool', async (req, res) => {
  try {
    const { input } = req.body;
    
    // We provide a dummy 'get_weather' tool
    const response = await getAI().models.generateContent({
      model: getModel(),
      contents: input || "What's the weather like in Tokyo right now?",
      config: {
        tools: [{
          functionDeclarations: [{
            name: "get_weather",
            description: "Get the current weather in a given location",
            parameters: {
              type: "OBJECT",
              properties: {
                location: { type: "STRING", description: "City and state, e.g. San Francisco, CA" },
                unit: { type: "STRING" }
              },
              required: ["location"]
            }
          }]
        }]
      }
    });

    let output_text = response.text || "";
    // Append tool call visibility if function was called
    if (response.functionCalls && response.functionCalls.length > 0) {
       output_text += `\n[Tool Called: ${response.functionCalls[0].name} with args ${JSON.stringify(response.functionCalls[0].args)}]`;
    }

    res.json({ 
      output_text,
      full_response: response
    });
  } catch (error) {
    console.error('[Workflow Error - Tool]', error.message);
    res.status(500).json({ error: error.message });
  }
});

/* ─── 4. Multimodal (Vision) Workflow ──────────────────────────── */
// Passes Text AND an Image to the model for analysis
router.post('/multimodal', async (req, res) => {
  try {
    const { input, imageUrl } = req.body;
    
    // Fallback if no URL provided
    const fallbackImage = "https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png";
    const urlToFetch = imageUrl || fallbackImage;
    
    // Gemini handles URLs via inlineData directly
    const imgResponse = await fetch(urlToFetch);
    const arrayBuffer = await imgResponse.arrayBuffer();
    const base64Img = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = imgResponse.headers.get('content-type') || 'image/png';

    const response = await getAI().models.generateContent({
      model: getModel(),
      contents: [
        {
          role: 'user',
          parts: [
            { text: input || "Describe what is in this image." },
            { inlineData: { data: base64Img, mimeType } }
          ]
        }
      ]
    });

    res.json({ 
      output_text: response.text,
      full_response: response
    });
  } catch (error) {
    console.error('[Workflow Error - Multimodal]', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
