# AI Chat Application

This is a full-stack AI chat application built using React for the frontend and FastAPI for the backend, with PostgreSQL as the database. The application integrates with the Google Gemini API to generate intelligent responses.Users can authenticate using Google OAuth, create chat sessions, send messages, and receive AI-generated replies while maintaining chat history.

---
<p align="center">
  <img src="frontend/src/assets/Screenshot.png" width="100%" alt="ASKME AI Application Screenshot">
</p>

---
## 🌟 Key Features

- ⚡ **Real-time AI Streaming** – Low-latency streaming using Google GenAI SDK  
- 🔁 **Multi Models Support** – Switch between Models like:
  - Gemini 1.5 Flash 
  - Gemini 1.5 Pro 
- 💾 **Persistent Chat Storage** – PostgreSQL-based chat history & logs  
- 🌑 **Obsidian Dark UI** – Built with Tailwind CSS v4  
- 🔐 **Secure Authentication** – Google OAuth + JWT session handling  
- 🧠 **Smart Title Generation** – Auto-generated chat titles using Gemma 2  

---
## 🏗 System Architecture

<p align="center">
  <img src="./frontend/src/assets/SystemArchitecture.png" 
       alt="System Architecture" 
       width="50%" 
       style="max-width:500px;">
</p>


## 🛠 Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS v4
- Lucide Icons
- Framer Motion
- PrismJS
- React Hooks & Context API

### Backend
- FastAPI (Async)
- Google GenAI SDK (Gemini + Gemma)
- SQLAlchemy 2.0 (Async ORM)
- PostgreSQL (asyncpg)

---

## 📂 Project Folder Structure

```bash
/
├── backend/                        
│   └── app/                       # FastAPI Backend (API + AI Logic)
│       ├── api/                   # Route handlers (chats, users, logs)
│       ├── core/                  # Config, security, authentication
│       ├── db/                    # Database connection & session
│       ├── models/                # SQLAlchemy models
│       ├── schemas/               # Pydantic schemas (validation)
│       ├── services/              # Business logic & AI integration
│       ├── utils/                 # Helper utilities
│       └── main.py                # App entry point
│
├── frontend/                      
│   └── src/                       # React Source Code
│       ├── api/                  # API calls (Axios services)
│       ├── assets/               # Images, icons
│       ├── components/           # Reusable UI components
│       ├── hooks/                # Custom React hooks
│       ├── lib/                  # Utilities (helpers, configs)
│       ├── pages/                # Route-level components
│       ├── App.jsx               # Root component
│       └── main.jsx              # React entry point
│
├── backend/.env                  # Backend environment variables
├── frontend/.env                 # Frontend environment variables

---

## 🔍 Folder Responsibilities

### 🔧 Backend (`app/`)

- **api/** → Defines all API endpoints (routers)
- **core/** → Authentication, config, security
- **db/** → Database connection & session
- **models/** → ORM models (User, ChatSession, Message, Logs)
- **schemas/** → Request/response validation (Pydantic)
- **services/** → Business logic & AI integration
- **utils/** → Helper functions
- **main.py** → FastAPI entry point

---

### 🎨 Frontend (`src/`)

- **api/** → Backend API communication
- **assets/** → Static files (images, icons)
- **components/** → Reusable UI components
- **hooks/** → Custom hooks
- **lib/** → Utility functions
- **pages/** → Route-based UI screens
- **App.jsx** → Main app structure
- **main.jsx** → React bootstrap

---

## ⚙️ Setup & Installation

### ✅ Prerequisites

- Node.js (v18+)
- Python (v3.10+)
- PostgreSQL

---

## 🔧 Backend Setup

```bash
cd backend
python -m venv venv
```

Activate virtual environment:

```bash
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 🔐 Environment Variables

Create PostgreSQL Database

Create a `.env` file:

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost/dbname
GEMINI_API_KEY=your_google_ai_studio_key
GOOGLE_CLIENT_ID=your_google_client_id
```

Initialize database:

```bash
python init_db.py
```

Run server:

```bash
uvicorn app.main:app --reload 
```

---

## 🎨 Frontend Setup

```bash
cd frontend
npm install
```

### 🌐 Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### ▶️ Run the App

```bash
npm run dev
```

## 📖 API Reference & Documentation

All endpoints are secured using **Google OAuth 2.0 authentication**.

---

### 💬 Chat & AI Service (`/api/v1/chats`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all chat sessions (sorted by date) |
| POST | `/` | Create new session + generate AI title + stream response |
| POST | `/{chat_id}/messages` | Send message & stream AI response |
| GET | `/{chat_id}/messages` | Get full chat history |
| PUT | `/{chat_id}/title` | Update chat title |
| DELETE | `/{chat_id}` | Delete chat & cascade messages |

---

### 👤 User & Authentication (`/api/v1/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sync-user` | Verify Google token & sync user |

---

### 📊 Audit & Logs (`/api/v1/logs`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Fetch user activity logs |

---

## 🗄️ Database Models

The backend uses **SQLAlchemy 2.0 (Async ORM)** with PostgreSQL optimizations like `UUID`, `JSONB`, `INET`, and indexing for performance.

---
## 🗄️ ER Diagram

<p align="center">
  <img src="./frontend/src/assets/ERDiagram.png" 
       alt="ER Diagram" 
       width="50%" 
       style="max-width:500px;">
</p>
---

## 📌 Future Improvements

- Multi-user collaboration
- File upload (PDF/Image chat)
- Voice interaction
- AI memory optimization
