# Clarity — BookMind AI

> Transform any book into your personal AI teacher.

![BookMind AI](https://img.shields.io/badge/Stack-MERN-green) ![AI](https://img.shields.io/badge/AI-Gemini%201.5%20Pro-blue) ![Vector DB](https://img.shields.io/badge/VectorDB-Qdrant-orange)

## Overview

Clarity is an AI-powered learning platform where users upload a book (PDF or DOCX) and interact with it as if they were talking to a knowledgeable tutor. It uses Retrieval-Augmented Generation (RAG) to ground every answer in your book, with exact page and paragraph citations.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Vanilla CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose) |
| Vector DB | Qdrant |
| AI | Google Gemini 1.5 Pro |
| File Storage | Cloudinary |
| Auth | Firebase (Google + Email/Password) |
| Real-time | Socket.io |
| PDF Viewer | react-pdf |
| Payments | Razorpay + Stripe (Phase 6) |

## Project Structure

```
clarity/
├── client/          # React + Vite Frontend
├── server/          # Node.js + Express Backend
├── .env.example     # Environment variables template
└── README.md
```

## Pages

| # | Page | Route |
|---|------|-------|
| 1 | Landing Page | `/` |
| 2 | Login | `/login` |
| 3 | Signup | `/signup` |
| 4 | Dashboard | `/dashboard` |
| 5 | Upload | `/upload` |
| 6 | **Book Chat** | `/book/:id/chat` |
| 7 | Library | `/library` |
| 8 | Book Detail | `/book/:id` |
| 9 | Notebook | `/notebook` |
| 10 | Analytics | `/analytics` |
| 11 | Settings | `/settings` |
| 12 | Pricing | `/pricing` |

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Qdrant Cloud account
- Google Cloud project (Gemini API key)
- Firebase project
- Cloudinary account

### Installation

```bash
# Clone the repo
git clone https://github.com/jaskeeratsingh05/clarity.git
cd clarity

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Environment Variables

Copy `.env.example` to `.env` in both `server/` and `client/` directories and fill in your keys.

### Running Locally

```bash
# Terminal 1 — Start backend
cd server
npm run dev

# Terminal 2 — Start frontend
cd client
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:5000

## Development Phases

| Phase | Status | Focus |
|-------|--------|-------|
| Phase 1 | 🔄 In Progress | Scaffold + Auth + Landing |
| Phase 2 | ⏳ Pending | Upload + Processing Pipeline |
| Phase 3 | ⏳ Pending | Core AI Chat (RAG) |
| Phase 4 | ⏳ Pending | Library + Book Detail |
| Phase 5 | ⏳ Pending | Notebook + Analytics + Voice |
| Phase 6 | ⏳ Pending | Payments + Polish + Deploy |

## License

MIT
