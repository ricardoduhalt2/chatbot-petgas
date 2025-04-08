# CHIDO - Chatbot Inteligente para PETGAS y Residuos Plásticos

**CHIDO** es un asistente conversacional inteligente diseñado para responder preguntas sobre residuos plásticos, reciclaje y la empresa PETGAS, priorizando información confiable y aprendiendo con el tiempo.

## Características

- **Chatbot web** fácil de integrar en cualquier página.
- **Base de conocimiento** alojada en Supabase, que se enriquece automáticamente con nuevas respuestas.
- **IA integrada** mediante OpenRouter para responder cuando no hay información suficiente.
- **Priorización de fuentes confiables**: petgascoin.com, petgas.com.mx, petgas.com.do.
- **Despliegue en Vercel** con funciones serverless y contenido estático.

## Funcionamiento

1. El usuario escribe una pregunta en el chatbot.
2. El backend busca coincidencias en la base de conocimiento.
3. Si no hay coincidencias relevantes, consulta a OpenRouter (modelo quasar-alpha).
4. Si la respuesta AI es útil y no genérica, se guarda en la base para mejorar futuras respuestas.
5. La respuesta se muestra al usuario en tiempo real.

## Tecnologías

- **Frontend:** HTML, Tailwind CSS, JavaScript
- **Backend:** Node.js, Express, Serverless Functions (Vercel)
- **Base de datos:** Supabase
- **IA:** OpenRouter API

## Estructura del proyecto

- `/public`: Archivos estáticos y chatbot embebible.
- `/api/ask.js`: Función serverless para responder preguntas.
- `/backend/server.js`: Backend Express alternativo.
- `/server.js`: Backend Express alternativo (posible redundancia).
- `vercel.json`: Configuración de despliegue en Vercel.

## Variables de entorno necesarias

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE`
- `OPENROUTER_API_KEY`
- `PORT` (opcional, por defecto 3001)

## Despliegue

El proyecto está preparado para desplegarse en Vercel, sirviendo contenido estático y funciones serverless para el chatbot.
