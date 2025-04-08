const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

app.post('/ask', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Missing question' });

  try {
    // Normalizar pregunta para mejorar coincidencia
    const normalize = (str) =>
      str
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar tildes
        .replace(/[¿?¡!.,]/g, '') // quitar signos de puntuación
        .replace(/\s+/g, ' ') // espacios múltiples a uno
        .trim();

    const normalizedQuestion = normalize(question);

    console.log('Pregunta normalizada:', normalizedQuestion);

    // 1. Fetch all knowledge base entries and keywords
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
        const keywordMap = {}; // Map knowledge_id to its keywords
        if (keywordsData && Array.isArray(keywordsData)) {
            keywordsData.forEach(row => {
                if (!keywordMap[row.knowledge_id]) {
                    keywordMap[row.knowledge_id] = [];
                }
                keywordMap[row.knowledge_id].push(normalize(row.keyword || ''));
            });
        }

        for (const entry of kbEntries) {
            if (!entry.answer || isGeneric(entry.answer)) continue; // Skip generic/empty answers

            const normalizedEntryQuestion = normalize(entry.question || '');
            const entryKeywords = keywordMap[entry.id] || [];
            let score = 0;

            // Score based on keyword match
            for (const qk of questionKeywords) {
                if (entryKeywords.some(ek => ek.includes(qk))) {
                    score += 2; // Higher weight for keyword match
                }
            }

            // Score based on direct question word match
            for (const qk of questionKeywords) {
                if (normalizedEntryQuestion.includes(qk)) {
                    score += 1;
                }
            }

             // Bonus for exact match (or near exact)
             if (normalizedEntryQuestion === normalizedQuestion) {
                score += 5;
             }

            // console.log(`Entry ID ${entry.id}, Question: "${normalizedEntryQuestion}", Score: ${score}`); // Optional: Log score per entry
            if (score > 0) { // Only consider entries with some score
                scoredEntries.push({ ...entry, score });
            }
        }
    }

    // Sort entries by score descending
    scoredEntries.sort((a, b) => b.score - a.score);

    // Check if the top score meets the threshold
    const bestMatch = scoredEntries[0];
    const MIN_SCORE_THRESHOLD = 2; // Adjust threshold as needed

    if (bestMatch && bestMatch.score >= MIN_SCORE_THRESHOLD) {
        console.log('Mejor respuesta encontrada en Supabase con score', bestMatch.score, ':', bestMatch.answer);
        return res.json({ answer: bestMatch.answer });
    }

    console.log('No se encontró respuesta suficientemente relevante (mejor score:', bestMatch?.score ?? 0, '), consultando OpenRouter...');

    // Construir prompt para priorizar base de datos y sitios web
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

    const aiResponse = await fetchOpenRouter(prompt);
    console.log('Respuesta OpenRouter:', aiResponse);

    // Only save if the response is not generic AND no good match was found in Supabase
    if (!isGeneric(aiResponse) && (!bestMatch || bestMatch.score < MIN_SCORE_THRESHOLD)) {
        console.log('Guardando nueva respuesta de OpenRouter...');
        const { error: insertError } = await supabase
            .from('knowledge_base')
            .insert([{ question, answer: aiResponse }]);
        if (insertError) console.error('Error guardando en Supabase:', insertError);
    } else {
        console.log('Respuesta genérica o ya existe una buena respuesta, no se guarda.');
    }

    return res.json({ answer: aiResponse }); // Return OpenRouter response even if not saved
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

async function fetchOpenRouter(question) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'quasar-alpha',
        messages: [{ role: 'user', content: question }]
      })
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No tengo una respuesta en este momento.';
  } catch (err) {
    console.error('Error consultando OpenRouter:', err);
    return 'No tengo una respuesta en este momento.';
  }
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('Backend running on port', PORT));
