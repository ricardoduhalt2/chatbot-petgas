const path = require('path');
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

app.post('/ask', async (req, res) => {
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

    if (normalizedQuestion === 'superchido') {
      console.log('Activando modo SUPERCHIDO');
      res.json({ answer: 'Modo chat abierto activado. Ahora puedes hacer preguntas fuera de la base de conocimiento.' });
      return;
    }

    if (req.body.superchido === true) {
      console.log('Modo SUPERCHIDO activo, consultando solo Gemini');
      const prompt = `
Responde la siguiente pregunta sobre residuos plásticos en República Dominicana y PETGAS.

Prioriza la información de la base de conocimiento y de los sitios:
- petgascoin.com
- petgas.com.mx
- petgas.com.do

Solo si no encuentras información suficiente en esas fuentes, usa tu conocimiento general o fuentes externas.

Pregunta: ${question}
`;

      const aiResponse = await fetchGemini(prompt);
      console.log('Respuesta Gemini:', aiResponse);
      return res.json({ answer: aiResponse });
    }

    // Si no es superchido, consultar base de conocimiento
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

    // Ya no guardar automáticamente, requerir aprobación manual
    return res.json({ answer: aiResponse, pendingApproval: true });
  } catch (err) {
    console.error('Error en endpoint /ask:', err);
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
      return res.status(500).json({ error: 'Error saving answer' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error en /save-answer:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3001;

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
    return res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
  }
});

// Generar preguntas y respuestas a partir de texto plano (heurística mejorada)
app.post('/generate-qa', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Falta el texto' });

  const qas = [];

  const cleanText = text
    .replace(/#+\s?/g, '') // eliminar encabezados markdown
    .replace(/\*\*/g, '')  // eliminar negritas markdown
    .replace(/[_*]/g, '')  // eliminar cursivas y asteriscos
    .replace(/`/g, '')     // eliminar backticks
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // eliminar enlaces markdown, dejar solo texto visible
    .replace(/\.\.\./g, ''); // eliminar todos los truncamientos "..."

  const lines = cleanText
    .split('\n')
    .map(l => l.trim().replace(/\.\.\./g, '')) // eliminar truncamientos en cada línea
    .filter(l => l);

  for (const line of lines) {
    if (line.endsWith('?')) continue; // saltar preguntas existentes
    if (line.length < 10) continue; // saltar líneas muy cortas

    let question = '';

    // Si la línea parece un título o encabezado
    if (/^[0-9]+\.\s/.test(line) || /^#+\s/.test(line) || /^[A-Z\s]+$/.test(line)) {
      question = `¿Qué es "${line}"?`;
    } else if (line.toLowerCase().includes('petgas')) {
      question = `¿Qué es ${line.split(' ')[0]}?`;
    } else if (line.length < 150) {
      question = `¿Qué significa: "${line}"?`;
    } else {
      question = `¿De qué trata el siguiente texto?`;
    }

    // Corrección profunda: asegurar que la pregunta empiece con "¿Qué"
    question = question.replace(/^Qu\s/, '¿Qué ');
    question = question.replace(/^Qu/, '¿Qué');
    question = question.replace(/\.\.\./g, '');

    qas.push({
      question,
      answer: line
    });
  }

  console.log('Preguntas generadas:', qas.map(q => q.question));
  res.json({ qas });
});

// Insertar preguntas y respuestas confirmadas en Supabase
app.post('/insert-qa', async (req, res) => {
  const { qas } = req.body;
  if (!qas || !Array.isArray(qas)) {
    return res.status(400).json({ error: 'Faltan preguntas y respuestas' });
  }

  try {
    const inserts = qas.map(({ question, answer }) => ({ question, answer }));
    const { error } = await supabase.from('knowledge_base').insert(inserts);
    if (error) {
      console.error('Error insertando en Supabase:', error);
      return res.status(500).json({ error: 'Error insertando en Supabase' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error en /insert-qa:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/knowledge', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('question, answer')
      .order('id', { ascending: false });
    if (error) {
      console.error('Error fetching knowledge base:', error);
      return res.status(500).json({ error: 'Error fetching knowledge base' });
    }
    console.log('Knowledge base data:', data);
    res.json({ data });
  } catch (err) {
    console.error('Error in /knowledge:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/generate-qa-ai', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Falta el texto' });

  const prompt = `
Dado el siguiente texto, genera una lista de pares pregunta-respuesta en formato JSON.
Cada par debe tener una pregunta clara y su respuesta correspondiente, sin truncamientos ni puntos suspensivos.

Texto:
${text}

Formato de salida:
[
  {"question": "Pregunta 1", "answer": "Respuesta 1"},
  {"question": "Pregunta 2", "answer": "Respuesta 2"},
  ...
]
`;

  try {
    const aiResponse = await fetchGemini(prompt);
    const jsonStart = aiResponse.indexOf('[');
    const jsonEnd = aiResponse.lastIndexOf(']');
    let qas = [];

    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonString = aiResponse.substring(jsonStart, jsonEnd + 1);
      try {
        qas = JSON.parse(jsonString);
      } catch (e) {
        console.error('Error parseando JSON de Gemini:', e);
      }
    }

    res.json({ qas });
  } catch (err) {
    console.error('Error en /generate-qa-ai:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => console.log('Backend running on port', PORT));
