const path = require('path');
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const { GoogleGenAI } = require('@google/genai');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const googleGenAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
console.log('googleGenAI object:', googleGenAI);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

app.post('/ask', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Missing question' });

  try {
    const { data: kbEntries, error: kbError } = await supabase
      .from('knowledge_base')
      .select('id, question, answer')
      .limit(1000);

    const { data: keywordsData, error: keywordsError } = await supabase
      .from('keywords')
      .select('knowledge_id, keyword');

    if (kbError) console.error('Error fetching knowledge base:', kbError);
    if (keywordsError) console.error('Error fetching keywords:', keywordsError);

    const scoredEntries = [];
    const questionKeywords = question.split(' ').filter(w => w.length > 2);

    if (kbEntries && Array.isArray(kbEntries)) {
      const keywordMap = {};
      if (keywordsData && Array.isArray(keywordsData)) {
        keywordsData.forEach(row => {
          if (!keywordMap[row.knowledge_id]) {
            keywordMap[row.knowledge_id] = [];
          }
          keywordMap[row.knowledge_id].push(row.keyword);
        });
      }

      for (const entry of kbEntries) {
        if (!entry.answer) continue;

        const normalizedEntryQuestion = entry.question;
        const entryKeywords = keywordMap[entry.id] || [];
        let score = 0;

        for (const qk of questionKeywords) {
          if (entryKeywords.some(ek => ek.includes(qk))) score += 2;
        }
        for (const qk of questionKeywords) {
          if (normalizedEntryQuestion.includes(qk)) score += 1;
        }

        if (score > 0) scoredEntries.push({ ...entry, score });
      }
    }

    scoredEntries.sort((a, b) => b.score - a.score);
    const bestMatch = scoredEntries[0];
    const MIN_SCORE_THRESHOLD = 2;

    let prompt = question;
    if (scoredEntries.length > 0) {
      const knowledgeBaseContext = scoredEntries
        .map(entry => `Question: ${entry.question}\nAnswer: ${entry.answer}`)
        .join('\n\n');
      prompt = `Based on the following knowledge base entries, answer the user's question. If the knowledge base does not contain relevant information, use your own knowledge.\n\nKnowledge Base:\n${knowledgeBaseContext}\n\nUser Question: ${question}`;
      console.log('Found relevant entries in Supabase. Consulting Gemini with context.');
    } else {
      console.log('No relevant entries found in Supabase. Consulting Gemini without context.');
    }

    try {
      const result = await googleGenAI.models.generateContent({
        model: "gemini-1.5-flash-latest",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });
      console.log('Gemini generateContent result:', result);
      const aiResponse = result.candidates[0].content.parts[0].text;
      console.log('Respuesta Gemini:', aiResponse);
      return res.json({ answer: aiResponse });
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return res.status(500).json({ error: 'Error calling Gemini API: ' + error.message });
    }
  } catch (err) {
    console.error('Error en endpoint /ask:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/save-answer', async (req, res) => {
  const { question, answer } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ error: 'Missing question or answer' });
  }
  try {
    const { error } = await supabase
      .from('knowledge_base')
      .insert([{ question, answer }]);
    if (error) {
      console.error('Error guardando respuesta aprobada:', error);
      return res.status(500).json({ error: 'Error insertando en Supabase' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error en /save-answer:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

console.log("process.env.PORT:", process.env.PORT);
const PORT = process.env.PORT || 3002;

// --- NUEVOS ENDPOINTS PARA ALIMENTAR BASE DE CONOCIMIENTO ---

// Login simple con usuario y contraseña fijos
const USERS = {
  admin: 'admin123',
  editor: 'editor123'
};

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (USERS[username] && USERS[username] === password) {
    return res.json({ success: true });
  } else {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }
});

// Generar preguntas y respuestas a partir de texto plano (heurística mejorada)
app.post('/generate-qa', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Falta el texto' });

  try {
    const model = googleGenAI.model({ model: "gemini-1.5-flash-latest"});
    const result = await model.generateContent(text);
    const aiResponse = result.candidates[0].content.parts[0].text;
    console.log('Respuesta Gemini:', aiResponse);
    res.json({ qas: aiResponse });
  } catch (err) {
    console.error('Error en /generate-qa:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => console.log('Backend running on port', PORT));
