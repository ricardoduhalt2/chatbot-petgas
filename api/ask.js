const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

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

async function fetchOpenRouter(prompt) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'quasar-alpha',
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No tengo una respuesta en este momento.';
  } catch (err) {
    console.error('Error consultando OpenRouter:', err);
    return 'No tengo una respuesta en este momento.';
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { question } = req.body;
    if (!question) {
      res.status(400).json({ error: 'Missing question' });
      return;
    }

    const normalize = (str) =>
      str
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[¿?¡!.,]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const normalizedQuestion = normalize(question);

    const { data: kbEntries } = await supabase
      .from('knowledge_base')
      .select('id, question, answer')
      .limit(1000);

    const { data: keywordsData } = await supabase
      .from('keywords')
      .select('knowledge_id, keyword');

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
      res.json({ answer: bestMatch.answer });
      return;
    }

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

    if (!isGeneric(aiResponse) && (!bestMatch || bestMatch.score < MIN_SCORE_THRESHOLD)) {
      await supabase.from('knowledge_base').insert([{ question, answer: aiResponse }]);
    }

    res.json({ answer: aiResponse });
  } catch (err) {
    console.error('Error en API /ask:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
