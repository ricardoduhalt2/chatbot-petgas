const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

function cleanText(text) {
  if (!text) return '';
  // No limpiar direcciones cripto (ej. 0x...)
  return text
    .replace(/(\*\*|__|[_*`#])/g, '') // eliminar markdown
    .replace(/\\n/g, '\n') // normalizar saltos de línea
    .replace(/\s+/g, ' ') // espacios múltiples
    .trim();
}

async function cleanKnowledgeBase() {
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('id, question, answer');

  if (error) {
    console.error('Error fetching knowledge base:', error);
    return;
  }

  for (const entry of data) {
    const cleanedQuestion = cleanText(entry.question);
    const cleanedAnswer = cleanText(entry.answer);

    if (cleanedQuestion !== entry.question || cleanedAnswer !== entry.answer) {
      const { error: updateError } = await supabase
        .from('knowledge_base')
        .update({ question: cleanedQuestion, answer: cleanedAnswer })
        .eq('id', entry.id);

      if (updateError) {
        console.error(`Error updating entry ${entry.id}:`, updateError);
      } else {
        console.log(`Cleaned entry ${entry.id}`);
      }
    }
  }

  console.log('Cleaning complete.');
}

cleanKnowledgeBase();
