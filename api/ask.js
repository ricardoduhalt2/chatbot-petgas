const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

let openChatMode = false;

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

function detectLangSimple(text) {
  const englishWords = ['what', 'who', 'where', 'when', 'why', 'how', 'is', 'are', 'do', 'does', 'can', 'could', 'would', 'should'];
  const lower = text.toLowerCase();
  let count = 0;
  for (const word of englishWords) {
    if (lower.includes(word)) count++;
  }
  return count >= 1 ? 'en' : 'es';
}

function detectLangFromText(text) {
  const englishWords = ['the', 'and', 'you', 'are', 'is', 'to', 'of', 'in', 'it', 'for', 'on', 'with', 'as', 'by', 'at', 'from'];
  const lower = text.toLowerCase();
  let count = 0;
  for (const word of englishWords) {
    if (lower.includes(word)) count++;
  }
  return count >= 2 ? 'en' : 'es';
}

function stripMarkdown(text) {
  if (!text) return '';
  return text.replace(/(\*\*|__|[_*`#])/g, '').trim();
}

async function fetchGemini(question, contextText, langHint = 'es') {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const prompt = langHint === 'en' ? `
Given the following question and a list of question-answer pairs from the knowledge base, evaluate each pair and assign a "score" between 0 and 1 indicating how relevant it is to the question (1 = very relevant, 0 = not relevant).

If any pair has a score above 0.8, return that as the best answer.

If none have a score above 0.8, generate a new answer based on the question and general context.

Return a JSON with:
- "answer": the best answer found or generated
- "score": the relevance score (1 if generated)
- "language": detected language ("es" or "en")

Do not use markdown formatting, asterisks, hashes, or any special symbols in the answer. Only plain text.

Question:
${question}

Knowledge base:
${contextText}

Respond only with the JSON, no explanations.
` : `
Dada la siguiente pregunta y una lista de pares pregunta-respuesta de la base de conocimiento, evalúa cada par y asigna un "score" entre 0 y 1 que indique cuán relevante es para la pregunta (1 = muy relevante, 0 = nada relevante).

Si alguno de los pares tiene un score mayor a 0.8, devuelve ese como la mejor respuesta.

Si ninguno supera 0.8, genera una respuesta nueva basada en la pregunta y el contexto general.

Devuelve un JSON con:
- "answer": la mejor respuesta encontrada o generada
- "score": el score de relevancia (1 si es generada)
- "language": el idioma detectado ("es" o "en")

No uses formato markdown, ni asteriscos, ni almohadillas, ni símbolos especiales en la respuesta. Solo texto plano.

Pregunta:
${question}

Base de conocimiento:
${contextText}

Responde solo con el JSON, sin explicaciones.
`;

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
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonString = text.substring(jsonStart, jsonEnd + 1);
        const parsed = JSON.parse(jsonString);

        // Elegir el mejor candidato
        let bestCandidate = null;
        if (parsed.candidates && Array.isArray(parsed.candidates)) {
          parsed.candidates.forEach(c => {
            if (!bestCandidate || (c.score > bestCandidate.score)) {
              bestCandidate = c;
            }
          });
        }

        // Si hay un candidato suficientemente bueno, usarlo
        if (bestCandidate && bestCandidate.score >= 0.7) {
          return { answer: stripMarkdown(bestCandidate.answer), score: bestCandidate.score, language: langHint };
        }

        // Si no, usar la respuesta generada
        if (parsed.generated_answer) {
          return { answer: stripMarkdown(parsed.generated_answer), score: 0.5, language: langHint };
        }
      }
    } catch (e) {
      console.error('Error parseando JSON de Gemini:', e);
    }
    return { answer: 'No tengo una respuesta en este momento.', score: 0, language: langHint };
  } catch (err) {
    console.error('Error consultando Gemini:', err);
    return { answer: 'No tengo una respuesta en este momento.', score: 0, language: 'es' };
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { question, superchido } = req.body;
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

    if (normalizedQuestion === 'superchido') {
      res.json({ answer: 'Modo chat abierto activado. Ahora puedes hacer preguntas fuera de la base de conocimiento.' });
      return;
    }

    if (!superchido) {
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
        const lang = detectLangFromText(bestMatch.answer);
        res.json({ answer: bestMatch.answer, language: lang });
        return;
      }

      let contextText = '';
      if (kbEntries && kbEntries.length > 0) {
        contextText += 'Base de conocimiento:\n';
        kbEntries.forEach(entry => {
          contextText += `Q: ${entry.question}\nA: ${entry.answer}\n`;
        });
      }

      const langHint = detectLangSimple(question);
      const geminiResult = await fetchGemini(question, contextText, langHint);

      if (!isGeneric(geminiResult.answer) && (!bestMatch || bestMatch.score < MIN_SCORE_THRESHOLD) && geminiResult.score < 0.8) {
        // Solo guardar si la confianza es baja y no hay buen match previo
        await supabase.from('knowledge_base').insert([{ question, answer: geminiResult.answer }]);
      }

      const lang = detectLangFromText(geminiResult.answer);
      res.json({ answer: geminiResult.answer, language: lang, score: geminiResult.score });
      return;
  }

  // If superchido is true, always use Gemini directly
  const langHint = detectLangSimple(question);
  const geminiResult = await fetchGemini(question, '', langHint);
  res.json({ answer: geminiResult.answer, language: geminiResult.language, score: geminiResult.score });
  } catch (err) {
    console.error('Error en API /ask:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
