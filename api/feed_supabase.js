const fetch = require('node-fetch');

const SUPABASE_URL = 'https://eqngpaogpxagisbpmhrp.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxbmdwYW9ncHhhZ2lzYnBtaHJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODQzMzM5NSwiZXhwIjoyMDU0MDA5Mzk1fQ.drRiCX2K6J9FOywBAmWSOvaD0Hl_asj6hZFMu4J5vlI';

const data = [
  {
    question: '¿Qué es Petgas?',
    answer: 'Petgas es una organización que transforma residuos plásticos no reciclables en energía y combustibles limpios mediante tecnología innovadora, con presencia en México y República Dominicana, y que también ha expandido su concepto al sector de criptomonedas.'
  },
  {
    question: '¿Cuál es la actividad principal de Petgas?',
    answer: 'Petgas utiliza un proceso avanzado de pirólisis no catalítica e ingeniería inversa en ausencia de oxígeno para convertir plásticos no reciclables en gas, sin emisiones contaminantes, y producir combustibles limpios mediante condensación cuántica.'
  },
  {
    question: '¿Petgas quema plástico?',
    answer: 'No, Petgas no quema plástico. Realiza un proceso de gasificación cerrado que no genera emisiones al medio ambiente.'
  },
  {
    question: '¿En qué países tiene presencia Petgas?',
    answer: 'Petgas tiene presencia principalmente en México y República Dominicana.'
  },
  {
    question: '¿Qué hace Petgas en México?',
    answer: 'En México, Petgas transforma residuos plásticos en energía mediante tecnología de gasificación, ayudando a resolver problemas ambientales relacionados con la contaminación por plásticos.'
  },
  {
    question: '¿Qué hace Petgas en República Dominicana?',
    answer: 'En República Dominicana, Petgas promueve esquemas de gestión integral de residuos, revalorización y generación de nuevas cadenas productivas con un modelo de economía circular cerrado, alineado con la estrategia climática del país.'
  },
  {
    question: '¿Qué es PetgasCoin?',
    answer: 'PetgasCoin es un token de criptomoneda identificado como $PGC, que opera en redes blockchain como Solana, Polygon y Binance Smart Chain, y forma parte del movimiento ecológico de Petgas.'
  },
  {
    question: '¿En qué redes blockchain opera PetgasCoin?',
    answer: 'PetgasCoin opera en Solana, Polygon y Binance Smart Chain.'
  },
  {
    question: '¿Cuál es el eslogan de PetgasCoin?',
    answer: 'Join the Petgas movement and transform into a greener tomorrow.'
  },
  {
    question: '¿Qué modelo económico sigue Petgas?',
    answer: 'Petgas adopta un modelo de economía circular que elimina residuos plásticos no reciclables, establece alianzas para un futuro sostenible, genera nuevas cadenas productivas y contribuye a la descontaminación del aire, suelo y agua.'
  },
  {
    question: '¿Cuáles son las etapas del proceso tecnológico de Petgas?',
    answer: 'El proceso consta de tres etapas: gasificación (conversión del plástico en gas mediante calor controlado), condensación cuántica (separación molecular por longitud de cadenas de carbono) y obtención de combustibles superiores compatibles con cualquier motor.'
  },
  {
    question: '¿Qué beneficios ambientales ofrece Petgas?',
    answer: 'Petgas contribuye a eliminar residuos plásticos no reciclables, reduce la contaminación ambiental y produce combustibles limpios sin generar emisiones contaminantes.'
  },
  {
    question: '¿Qué tipo de plásticos procesa Petgas?',
    answer: 'Petgas procesa residuos plásticos no reciclables, transformándolos en energía y combustibles limpios.'
  },
  {
    question: '¿Qué tecnología utiliza Petgas para transformar plásticos?',
    answer: 'Utiliza pirólisis no catalítica e ingeniería inversa en un proceso cerrado sin oxígeno, seguido de condensación cuántica para obtener combustibles de alta calidad.'
  },
  {
    question: '¿Qué productos finales obtiene Petgas?',
    answer: 'Obtiene combustibles limpios y superiores compatibles con cualquier motor, a partir de residuos plásticos no reciclables.'
  }
];

async function feedSupabase() {
  for (const item of data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_base`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(item)
    });
    const json = await res.json();
    console.log('Inserted:', json);
  }
}

feedSupabase().catch(console.error);
