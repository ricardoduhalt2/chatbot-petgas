# Deployment Log - CHIDO Project

## Final Status: **DEPLOYMENT SUCCESSFUL ON RENDER**

- URL de producción: **https://chatbot-petgas.onrender.com**
- Chatbot funcionando correctamente y accesible públicamente.
- Código de inserción disponible para empotrar en cualquier sitio web.

---

## Resumen del proceso

### Problemas con Vercel
- Múltiples intentos de despliegue en Vercel fallaron.
- Problemas con rutas de assets y API (`/api/ask` devolvía HTML en lugar de JSON).
- Protección por autenticación en Vercel impedía el acceso público a la API.
- Se intentaron múltiples configuraciones en `vercel.json` sin éxito.
- Finalmente, se descartó Vercel por restricciones de seguridad.

### Solución en Render
- Proyecto subido a GitHub y conectado a Render.com.
- Variables de entorno configuradas correctamente (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`, `OPENROUTER_API_KEY`).
- Despliegue exitoso sin problemas de autenticación.
- API `/api/ask` funcionando correctamente.
- Chatbot accesible y empotrable vía iframe.

---

## Código de inserción recomendado

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

## Estado final: **Misión cumplida. Chatbot desplegado y funcional en Render.**

---

## Comportamiento especial - Palabra clave "SUPERCHIDO"

- Cuando el usuario escribe **SUPERCHIDO**, el chatbot activa un **modo chat libre persistente**.
- En este modo, **todas las preguntas posteriores** se envían directamente a la API de Google Gemini, **ignorando completamente la base de conocimiento**.
- Este modo permanece activo **hasta que el usuario cierre o recargue la página**.
- La interfaz muestra un mensaje **"AHORA ESTÁS EN MODO SUPERCHIDO"** y un **LED rojo parpadeante** junto al ícono del bot para indicar que está activo.
- Esto permite obtener respuestas más abiertas y creativas desde la IA, sin restricciones.
- Por defecto, el chatbot prioriza la base de conocimiento y solo consulta la IA si no encuentra coincidencias relevantes.
- **Aprobación manual para aprendizaje:** Cuando Gemini genera una respuesta, el chatbot **pregunta al usuario si desea guardar esa respuesta** para futuras consultas.  
  Solo si el usuario aprueba manualmente, la respuesta se guarda en la base de conocimiento, permitiendo que el chatbot "aprenda" de manera controlada y segura.

### Alimentación de la base de conocimiento - Agosto 2025

- Se planificó y ejecutó la carga masiva de pares pregunta-respuesta derivados del **Acuerdo de París (2015)** y la **Contribución Nacionalmente Determinada 2020 (NDC-RD 2020)**.
- Se generó un **script SQL** para insertar estos datos en las tablas `knowledge_base` y `keywords` en Supabase.
- Cada entrada incluye preguntas, respuestas y palabras clave para mejorar la precisión del chatbot.
- Esta alimentación busca mejorar la capacidad del chatbot para responder sobre cambio climático, compromisos internacionales y acciones nacionales.
- Si algo falla o se requiere revertir, revisar este log y el script SQL utilizado.

---

### Alimentación de la base de conocimiento - Septiembre 2025

- Se creó el script `api/feed_supabase.js` para insertar preguntas y respuestas en Supabase vía API REST.
- Se implementó un **panel privado** (`/admin.html`) con:
  - Login (usuarios: `admin`/`admin123`, `editor`/`editor123`)
  - Formulario para pegar texto plano
  - Limpieza automática de símbolos Markdown (`#`, `*`, `_`, enlaces, backticks)
  - Eliminación de truncamientos `"..."` al inicio o final de líneas
  - Generación automática de preguntas y respuestas con heurística mejorada
  - Vista previa sin truncamientos, con saltos de línea y quiebre de palabras
  - Botón para insertar directamente en Supabase
- Se implementó un **panel público** (`/knowledge.html`) con:
  - Visualización de toda la base de conocimientos
  - Diseño compacto y responsivo
  - Buscador integrado
  - Paginación para grandes volúmenes
- El backend cuenta con endpoints:
  - `/ask` para responder preguntas
  - `/save-answer` para guardar respuestas aprobadas
  - `/login` para autenticación
  - `/generate-qa` para generar preguntas/respuestas desde texto
  - `/insert-qa` para insertar en Supabase
  - `/knowledge` para consultar toda la base
- La alimentación puede hacerse:
  - Manualmente con `sql/feed_knowledge_base.sql` + `node api/feed_supabase.js`
  - O mediante el panel privado con limpieza y vista previa
- La heurística para generar preguntas fue mejorada para evitar truncamientos y limpiar símbolos, generando preguntas más naturales y coherentes.
- Persisten algunos truncamientos `"..."` en preguntas generadas, detectados en Supabase y en pruebas recientes.
- Próxima corrección: limpiar explícitamente `"..."` en el texto fuente antes de generar preguntas, y asegurar que la palabra `"¿Qué"` esté correctamente formada.
- Documentación actualizada en README.md con todos estos pasos y funcionalidades.
