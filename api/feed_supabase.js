const fetch = require('node-fetch');

const SUPABASE_URL = 'https://eqngpaogpxagisbpmhrp.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxbmdwYW9ncHhhZ2lzYnBtaHJwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODQzMzM5NSwiZXhwIjoyMDU0MDA5Mzk1fQ.drRiCX2K6J9FOywBAmWSOvaD0Hl_asj6hZFMu4J5vlI';

const data = [
  {
    question: "What is Petgas?",
    answer: "Petgas is a Mexican company that transforms plastic waste, even mixed, into high-quality synthetic fuels like gasoline and diesel through a non-catalytic pyrolysis process, aiming to create a circular economy and reduce pollution."
  },
  {
    question: "Who works at Petgas?",
    answer: "Petgas Team:\n- Daniel Rodríguez Gutiérrez (CEO): drg@petgas.com.mx\n- José de Jesús Escoto Romero (Commercial Director): jer@petgas.com.mx\n- Jesús Manuel Escoto Faces (Global Linkage CSO & Marketing): jef@petgas.com.mx\n- Andoni Álvarez Heiling (Legal Director): legal@petgas.com.mx\n- Diego Escoto Yunes (Global Linkage Subdirector): dey@petgas.com.mx\n- Fabio Baca Padilla (Technology Development Director): fbp@petgas.com.mx\n- Kathia Liahut Lopez (Chemistry Area Head): quimica@petgas.com.mx\n- Christopher Trapp (Board Member): christopher.trapp@petgas.com.mx\n- Roberto Cerda (Petgas Oceans): oceans@petgas.com.mx\n- Sandra M. Ponce de León (International Alliances): spd@petgas.com.mx\n- Estefania Ferrera Salgado (Web3): efs@petgas.com.mx"
  },
  {
    question: "What environmental benefits does Petgas offer?",
    answer: "Petgas helps eliminate non-recyclable plastic waste, reduces environmental pollution, and produces clean fuels without generating polluting emissions."
  },
  {
    question: "What types of plastics does Petgas process?",
    answer: "Petgas processes non-recyclable plastic waste, transforming it into energy and clean fuels."
  },
  {
    question: "What technology does Petgas use to transform plastics?",
    answer: "Uses non-catalytic pyrolysis and reverse engineering in a closed oxygen-free process, followed by quantum condensation."
  },
  {
    question: "Does Petgas burn plastic?",
    answer: "No, Petgas doesn't burn plastic. It performs a closed gasification process that doesn't emit pollutants into the environment."
  },
  {
    question: "In which countries does Petgas operate?",
    answer: "Petgas operates mainly in Mexico and the Dominican Republic."
  },
  {
    question: "What is PetgasCoin?",
    answer: "PetgasCoin ($PGC) is a cryptocurrency token operating on Solana, Polygon, and Binance Smart Chain blockchains, part of Petgas' ecological movement."
  },
  {
    question: "On which blockchains does PetgasCoin operate?",
    answer: "Solana, Polygon, and Binance Smart Chain."
  },
  {
    question: "What is PetgasCoin's slogan?",
    answer: "Join the Petgas movement and transform into a greener tomorrow."
  },
  {
    question: "What are the stages of Petgas' technological process?",
    answer: "Three stages: 1) Gasification (plastic-to-gas conversion via controlled heat), 2) Quantum condensation (molecular separation by carbon chain length), 3) Production of superior motor-compatible fuels."
  },
  {
    question: "What environmental benefits does Petgas offer?",
    answer: "Petgas helps eliminate non-recyclable plastic waste, reduces environmental pollution, and produces clean fuels without generating polluting emissions."
  },
  {
    question: "What type of plastics does Petgas process?",
    answer: "Petgas processes non-recyclable plastic waste, transforming it into energy and clean fuels."
  },
  {
    question: "What technology does Petgas use to transform plastics?",
    answer: "Non-catalytic pyrolysis and reverse engineering in a closed oxygen-free process, followed by quantum condensation."
  },
  {
    question: "What products does Petgas obtain?",
    answer: "Clean, high-quality fuels compatible with any engine, from non-recyclable plastic waste."
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
