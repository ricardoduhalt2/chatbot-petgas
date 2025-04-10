# CHIDO System Documentation

## 🤖 AI Assistant Section (Historical Context)

### Deployment Timeline
- **Initial Deployment**: September 2023 - Basic chatbot with knowledge base
- **Vercel Issues**: Multiple failed deployments due to API/auth restrictions
- **Render Solution**: Successfully deployed on Render.com in October 2023
- **Key Updates**:
  - Added SUPERCHIDO mode (direct Gemini API access)
  - Implemented controlled learning (manual answer approval)
  - Added admin panel and public knowledge viewer
  - Fixed backend port configuration (now using 10000)

### Current System State (Sept 2025)
- **Backend**: Node.js/Express on port 10000
- **Frontend**: Embedded widget + admin panel
- **Database**: Supabase PostgreSQL
- **AI**: Google Gemini API integration
- **Special Modes**:
  - SUPERCHIDO: Bypasses knowledge base
  - Controlled Learning: Manual approval for new answers

### Critical Endpoints
- `/api/ask` - Main Q&A endpoint  
- `/knowledge` - Full knowledge base dump
- `/admin.html` - Admin interface
- `/knowledge.html` - Public knowledge viewer

---

## 📚 System Documentation (Human Readable)

### Project Overview
Web-based AI chatbot answering climate change questions with:
- Pre-loaded knowledge base
- AI-generated responses (Gemini)
- Admin controls for content management

### Technical Stack
- **Frontend**: HTML/CSS/JS
- **Backend**: Node.js/Express
- **Database**: Supabase
- **AI**: Google Gemini API

### Key Features
1. **Knowledge Base Chat**:
   - Answers from pre-approved Q&A pairs
   - Searchable knowledge base

2. **SUPERCHIDO Mode**:
   - Activates with "SUPERCHIDO" keyword  
   - Direct Gemini API access
   - Persistent until page reload

3. **Admin Panel**:
   - Content management
   - Answer approval system
   - Knowledge base editing

### Deployment
- **URL**: https://chatbot-petgas.onrender.com
- **Backend**: Runs on port 10000
- **Embed Code**:
```html
<iframe src="https://chatbot-petgas.onrender.com/chatbot.html"
  style="position:fixed;bottom:20px;right:20px;width:256px;height:500px;border:none;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:9999;"
  allow="microphone">
</iframe>
```

### Knowledge Base Access

#### Public Access
1. **Web Interface**: 
   - Visit `/knowledge.html` on the deployed site
   - Searchable list of all Q&A pairs
   - Read-only access to approved content

2. **API Endpoint**:
   - GET `/knowledge` returns full JSON knowledge base
   - Example curl:
     ```bash
     curl https://chatbot-petgas.onrender.com/knowledge
     ```

#### Admin Management
1. **Admin Panel**:
   - Access at `/admin.html`
   - Requires credentials (set in server.js)
   - Features:
     - Add/edit/delete Q&A pairs
     - Approve pending questions
     - Export/import knowledge base

2. **Direct Database Access**:
   - SQL scripts in `/sql/` folder
   - Main script: `feed_knowledge_base.sql`
   - Connect to Supabase using credentials from `.env`

3. **Programmatic Updates**:
   - POST to `/api/feed_supabase` with JSON payload:
     ```json
     {
       "question": "New question?",
       "answer": "New answer."
     }
     ```

### Maintenance
- **Credentials**: Hardcoded in backend/server.js
- **Knowledge Updates**: Via admin panel, API, or direct SQL
- **Logs**: All changes tracked in this file

Last Updated: September 2025
