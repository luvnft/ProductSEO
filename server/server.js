const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
const cors = require('cors');
const fetch = require('node-fetch'); // Import node-fetch
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const gemini_api_key = process.env.GEMINI_API_KEY;
if (!gemini_api_key) {
  console.error("Gemini API key is not set in the environment variables.");
  process.exit(1);
}

const googleAI = new GoogleGenerativeAI(gemini_api_key);
const geminiConfig = {
  temperature: 0.9,
  topP: 1,
  topK: 1,
  maxOutputTokens: 4096,
};

const app = express();

app.use(express.json());
app.use(cors());

app.post('/completions', async (req, res) => {
  try {
    const prompt = req.body.message;
    const geminiModel = googleAI.getGenerativeModel({
      model: "gemini-pro",
      geminiConfig,
    });

    // Make the request to Gemini
    const result = await geminiModel.generateContent(prompt);

    // Read the response from the API
    const responseText = result.response.text ? await result.response.text() : "No content generated";
    
    res.send({ text: responseText });
  } catch (error) {
    console.error("Response error:", error); // Log the actual error from Gemini
    res.status(500).send({ error: 'Failed to fetch data from Gemini' });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Catchall handler: For any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Express Server listening on port ${port}`);
});
