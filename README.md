# CHIDO Chatbot - Climate Knowledge Assistant

A web-based AI chatbot designed to answer questions about climate change, international agreements, and national commitments, with a knowledge base powered by Supabase and enhanced by Google Gemini AI.

---

## 🌐 Live Deployment

- **URL:** [https://chatbot-petgas.onrender.com](https://chatbot-petgas.onrender.com)
- **Status:** ✅ **Live and fully operational on Render**
- **Backend:** Node.js + Express, running on Render
- **Frontend:** Embeddable chatbot widget + admin panel

---

## 🚀 Recent Updates (October 2025)

### Últimos Cambios
- Implementado síntesis de voz para respuestas del chatbot
- Detección automática de idioma (español/inglés)
- Configuración de voz robótica con efectos especiales
- Mejorado diseño de la interfaz del chatbot
- **Mejorada la paginación en la base de conocimientos (`knowledge.html`) con números de página y resaltado de la página actual.**
- **Corregido el backend para que el endpoint `/knowledge` devuelva los registros ordenados por `id` descendente, mostrando los cambios más recientes primero.**
- **Reiniciado el backend para aplicar estas mejoras.**
- **Confirmado que ahora se visualizan correctamente los últimos cambios insertados en Supabase.**

## 🚀 Previous Updates (September 2025)

- Fixed broken `backend` submodule, converted to normal directory
- Added all backend source files to repository
- Corrected `package.json` start script to use root `server.js`
- Successful deployment on Render with backend running on port 10000
- Updated deployment logs with all recent fixes

---

## 🧠 Features

- **Knowledge Base:** Climate change, Paris Agreement, NDCs, and more
- **SUPERCHIDO Mode:** Free-form AI chat ignoring knowledge base
- **Voice Input:** Speech-to-text functionality with microphone support
- **Mobile Optimized:** Responsive design with touch-friendly interface
- **Admin Panel:** Upload and clean documents, generate Q&A pairs, approve AI responses
- **Public Knowledge Viewer:** Searchable, paginated access to all stored Q&A
- **Embeddable Widget:** Easily add chatbot to any website via iframe
- **Controlled Learning:** Manual approval before adding AI-generated answers to knowledge base

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express
- **Database:** Supabase (PostgreSQL)
- **AI Integration:** Google Gemini API
- **Frontend:** HTML, CSS, JavaScript
- **Deployment:** Render.com
- **Other:** Axios, dotenv, cors

---

## 🖥️ Running Locally

1. **Clone the repository**

```bash
git clone https://github.com/ricardoduhalt2/chatbot-petgas.git
cd chatbot-petgas
```

2. **Install dependencies**

```bash
npm install
cd backend
npm install
```

3. **Configure environment variables**

Create `.env` files in root and `backend/` with your Supabase and API keys.

4. **Start the server**

From the root directory:

```bash
npm start
```

The backend will run on port 3001 by default. Access the chatbot at:
- http://localhost:3001/chatbot.html
- http://localhost:3001/admin.html

---

## 📝 Deployment Notes

- The root `server.js` imports and starts the backend server.
- The `start` script in `package.json` is set to `node server.js`.
- The entire project is deployed from the root directory on Render.
- Environment variables must be configured in Render dashboard.

---

## 📄 Embedding the Chatbot

Use this iframe code to embed the chatbot on any website:

```html
<iframe 
  src="https://chatbot-petgas.onrender.com/chatbot.html" 
  style="position: fixed; bottom: 20px; right: 20px; width: 256px; height: 500px; border: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 9999;"
  allow="microphone"
></iframe>
```

---

## 📚 Documentation & Logs

See `deployment_log.md` for a detailed history of deployment steps, fixes, and features.

---

## 👤 Authors & Contact

- **Ricardo Duhalt**
- GitHub: [ricardoduhalt2](https://github.com/ricardoduhalt2)

---

## 📅 Last updated: October 2025
