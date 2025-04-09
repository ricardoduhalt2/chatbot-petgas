# CHIDO - Chatbot Inteligente para PETGAS y Residuos Plásticos

**CHIDO** es un asistente conversacional inteligente diseñado para responder preguntas sobre residuos plásticos, reciclaje y la empresa PETGAS, priorizando información confiable y aprendiendo con el tiempo.

## Características

- **Chatbot web** fácil de integrar en cualquier página.
- **Base de conocimiento** alojada en Supabase, que se enriquece automáticamente con nuevas respuestas.
- **IA integrada** mediante Google Gemini para responder cuando no hay información suficiente.
- **Priorización de fuentes confiables**: petgascoin.com, petgas.com.mx, petgas.com.do.
- **Despliegue en Render** con backend Node.js y frontend estático.

## Funcionamiento

1. El usuario escribe una pregunta en el chatbot.
2. El backend busca coincidencias en la base de conocimiento.
3. Si no hay coincidencias relevantes, consulta a Google Gemini (modelo gemini-2.0-flash).
4. Si la respuesta AI es útil y no genérica, se guarda en la base para mejorar futuras respuestas.
5. La respuesta se muestra al usuario en tiempo real.
6. **Modo SUPERCHIDO:** Si el usuario escribe "SUPERCHIDO", se activa un modo de chat libre donde **todas las preguntas posteriores** se envían directamente a Google Gemini, ignorando la base de conocimiento.  
   Este modo permanece activo hasta que se cierre o recargue la página.  
   En la interfaz, se muestra un mensaje "AHORA ESTÁS EN MODO SUPERCHIDO" y un LED rojo parpadeante junto al ícono del bot.
7. **Aprobación manual para aprendizaje:** Cuando Gemini genera una respuesta, el chatbot **pregunta si deseas guardar esa respuesta** para futuras consultas.  
   Solo si apruebas manualmente, la respuesta se guarda en la base de conocimiento, permitiendo que el chatbot "aprenda" de manera controlada.

## Tecnologías

- **Frontend:** HTML, Tailwind CSS, JavaScript
- **Backend:** Node.js, Express
- **Base de datos:** Supabase
- **IA:** Google Gemini API

## Estructura del proyecto

- `/public`: Archivos estáticos y chatbot embebible.
- `/api/ask.js`: Endpoint API para responder preguntas.
- `/backend/server.js`: Backend Express alternativo.
- `/server.js`: Backend Express alternativo (posible redundancia).
- `vercel.json`: Configuración previa para Vercel (ya no usada).

## Variables de entorno necesarias

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE`
- `GEMINI_API_KEY`
- `PORT` (opcional, por defecto 3001)

## Despliegue

El proyecto está desplegado exitosamente en **Render.com**:

**URL de producción:**  
https://chatbot-petgas.onrender.com

---

## Código para empotrar el chatbot en cualquier sitio web

```html
<iframe 
  src="https://chatbot-petgas.onrender.com/chatbot.html" 
  style="
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 256px;
    height: 500px;
    border: none;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
  "
  allow="microphone"
></iframe>
```

Pega este código en cualquier página web para mostrar el chatbot en la esquina inferior derecha.

---

## Mejoras estéticas - Agosto 2025

- Se añadió botón **"Enviar"** visible junto al campo de texto.
- Se agregó un botón flotante con el ícono del bot para abrir/cerrar el chat.
- Diseño más compacto y responsivo para móviles y escritorio.
- Encabezado simplificado con solo el texto **"CHIDO"**.
- Código de inserción actualizado para reflejar el nuevo diseño.
- Se añadió un **resplandor verde** alrededor del recuadro del chatbot para mayor visibilidad.
- Se mejoró el botón flotante con el ícono del bot, que ahora aparece cuando el chatbot está cerrado para poder abrirlo fácilmente.
- Se hizo visible nuevamente el botón **"Enviar"** junto al campo de texto para facilitar el envío de mensajes.

---

## Historial de alimentación de la base de conocimiento

- **Agosto 2025:**  
  Se alimentó la base de conocimiento con información estructurada proveniente del **Acuerdo de París** y la **NDC-RD 2020**.  
  Esto incluye preguntas frecuentes, respuestas claras y palabras clave asociadas, insertadas en Supabase mediante un script SQL.  
  El objetivo es mejorar la precisión del chatbot en temas de cambio climático, compromisos internacionales y acciones nacionales.

## Alimentar la base de conocimientos

Existen dos formas de alimentar la base de conocimientos en Supabase:

### 1. Alimentación manual con script SQL + API

- Edita o genera el archivo `sql/feed_knowledge_base.sql` con las preguntas y respuestas.
- Ejecuta el script:

```bash
node api/feed_supabase.js
```

Este script insertará automáticamente las preguntas y respuestas en Supabase.

### 2. Panel privado con login y formulario

- Accede a `http://localhost:3001/admin.html`
- Inicia sesión con:
  - Usuario: `admin` / Contraseña: `admin123`
  - o Usuario: `editor` / Contraseña: `editor123`
- Pega el texto plano (sin símbolos Markdown, aunque el sistema limpia algunos automáticamente).
- Haz clic en **Generar Preguntas y Respuestas**.
- Revisa la vista previa (ahora sin truncamientos).
- Confirma con **Insertar en Supabase**.

El backend limpia automáticamente símbolos Markdown (`#`, `*`, `_`, enlaces, backticks) y elimina truncamientos `"..."` al inicio o final de líneas.

---

## Panel público

- Accede a `http://localhost:3001/knowledge.html`
- Visualiza toda la base de conocimientos con diseño compacto, buscador y paginación.

---

## Funciones de Gemini en este proyecto

- **Responder preguntas del usuario:**  
  Cuando el usuario hace una pregunta y no hay coincidencias relevantes en la base de conocimientos, el backend envía la pregunta a Gemini para obtener una respuesta generada por IA, contextualizada y natural.

- **Generar preguntas y respuestas automáticas:**  
  A partir de un texto largo, Gemini genera pares pregunta-respuesta en formato JSON, sin truncamientos ni errores, para alimentar la base de conocimientos con información de alta calidad.

- **Alimentar la base desde el formulario privado:**  
  El formulario privado usa la API de Gemini para convertir texto plano en preguntas y respuestas automáticas, que el usuario puede revisar y confirmar antes de insertarlas en Supabase.

---

## Estado final

- Backend con endpoints `/ask`, `/save-answer`, `/login`, `/generate-qa`, `/generate-qa-ai`, `/insert-qa`, `/knowledge`.
- Panel privado para alimentar la base con limpieza automática, generación con Gemini y vista previa sin truncamientos.
- Panel público para explorar la base con buscador y paginación.
- Alimentación también posible vía script `api/feed_supabase.js`.
- Heurística mejorada para generar preguntas más naturales y limpias.
- Integración con Gemini para respuestas y generación de conocimiento.

**Chatbot desplegado y funcionando correctamente en Render. Misión cumplida.**
