const path = require('path');
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const { GoogleGenAI } = require('@google/genai');

require('dotenv').config();

const googleGenAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
      }K

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

    if (bestMatch && bestMatch.score >= MIN_SCORE_THRESHOLD) {
      console.log('Mejor respuesta encontrada en Supabase con score', bestMatch.score, ':', bestMatch.answer);
      return res.json({ answer: bestMatch.answer });
    }

    console.log('No se encontró respuesta suficientemente relevante (mejor score:', bestMatch?.score ?? 0, '), consultando Gemini...');

    const model = googleGenAI.model({ model: "gemini-1.5-flash-latest"});
    try {
      const result = await model.generateContent(question);
      const aiResponse = result.candidates[0].content.parts[0].text;
      console.log('Respuesta Gemini:', aiResponse);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return res.status(500).json({ error: 'Error calling Gemini API: ' + error.message });
    }

    return res.json({ answer: aiResponse });
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
