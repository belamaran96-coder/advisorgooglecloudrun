const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `
You are HealthAssist AI, a helpful healthcare assistant.

Important disclaimers to include when relevant:
- I am an AI assistant, not a doctor. Always consult healthcare professionals for medical advice.
- For medical emergencies, contact emergency services immediately.
- This information is for educational purposes only.
`;

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `${SYSTEM_PROMPT}\n\nUser: ${message}\nAI:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ response: text });
  } catch (error) {
    res.status(500).json({ error: 'Error processing your request. Please try again.' });
  }
});

module.exports = app;
