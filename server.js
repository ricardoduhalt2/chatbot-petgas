const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

require('dotenv').config();

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static('public'));

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

app.post('/api/ask', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Missing question' });

  try {
    const normalize = (str) =>
      str
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[¿?¡!.,]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const normalizedQuestion = normalize(question);

    console.log('Pregunta normalizada:', normalizedQuestion);

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
    const questionKeywords = normalizedQuestion.split(' ').filter(w => w.length > 2);

    if (kbEntries && Array.isArray(kbEntries)) {
      const keywordMap = {};
      if (keywordsData && Array.isArray(keywordsData)) {
        keywordsData.forEach(row => {
          if (!keywordMap[row.knowledge_id]) {
            keywordMap[row.knowledge_id] = [];
          }
          keywordMap[row.knowledge_id].push(normalize(row.keyword || ''));
        });
      }

      for (const entry of kbEntries) {
        if (!entry.answer || isGeneric(entry.answer)) continue;

        const normalizedEntryQuestion = normalize(entry.question || '');
        const entryKeywords = keywordMap[entry.id] || [];
        let score = 0;

        for (const qk of questionKeywords) {
          if (entryKeywords.some(ek => ek.includes(qk))) score += 2;
        }
        for (const qk of questionKeywords) {
          if (normalizedEntryQuestion.includes(qk)) score += 1;
        }
        if (normalizedEntryQuestion === normalizedQuestion) score += 5;

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

    let contextText = '';
    if (kbEntries && kbEntries.length > 0) {
      contextText += 'Base de conocimiento:\n';
      kbEntries.forEach(entry => {
        contextText += `Q: ${entry.question}\nA: ${entry.answer}\n`;
      });
    }

    const prompt = `
Responde la siguiente pregunta sobre residuos plásticos en República Dominicana y PETGAS.

Prioriza la información de la base de conocimiento y de los sitios:
- petgascoin.com
- petgas.com.mx
- petgas.com.do

Solo si no encuentras información suficiente en esas fuentes, usa tu conocimiento general o fuentes externas.

Pregunta: ${question}

Contexto:
${contextText}
`;

    const aiResponse = await fetchGemini(prompt);
    console.log('Respuesta Gemini:', aiResponse);

    if (!isGeneric(aiResponse) && (!bestMatch || bestMatch.score < MIN_SCORE_THRESHOLD)) {
      console.log('Guardando nueva respuesta de Gemini...');
      const { error: insertError } = await supabase
        .from('knowledge_base')
        .insert([{ question, answer: aiResponse }]);
      if (insertError) console.error('Error guardando en Supabase:', insertError);
    } else {
      console.log('Respuesta genérica o ya existe una buena respuesta, no se guarda.');
    }

    return res.json({ answer: aiResponse });
  } catch (err) {
    console.error('Error en endpoint /api/ask:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

function isGeneric(answer) {
  if (!answer) return true;
  const normalized = answer.toLowerCase().trim();
  const genericResponses = [
    'no lo sé',
    'no tengo información',
    'no estoy seguro',
    'no puedo responder',
    'no tengo una respuesta en este momento',
    'no tengo una respuesta'
  ];
  return genericResponses.some(g => normalized.includes(g));
}

async function fetchGemini(prompt) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No tengo una respuesta en este momento.';
  } catch (err) {
    console.error('Error consultando Gemini:', err);
    return 'No tengo una respuesta en este momento.';
  }
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('Backend running on port', PORT));
