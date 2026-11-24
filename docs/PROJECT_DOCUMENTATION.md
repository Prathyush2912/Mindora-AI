
# Mindora — AI-Assisted Learning

> Exploring the use of artificial intelligence and modern web technologies to make studying more interactive and accessible.

Mindora is a personal software development project focused on building an AI-assisted learning application. It combines document processing, text extraction, OCR and AI-generated summaries to help students work with their study materials.

The project is an exploration of full-stack development and practical AI integration, built with React, TypeScript and Supabase.

## Overview

Mindora focuses on five main areas:

- **Authentication** — User registration and login.
- **Study Materials** — Upload, organize and access PDF and TXT documents.
- **AI Summaries** — Generate structured summaries from uploaded study materials.
- **Flashcards** — Planned interactive review tools.
- **Quizzes** — Planned AI-generated practice questions.

## Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend interface |
| TypeScript | Application logic and type safety |
| Vite | Development and build tooling |
| Tailwind CSS | Styling |
| Supabase | Authentication, PostgreSQL database and file storage |
| Supabase Edge Functions | Server-side AI integration |
| Groq API | AI summary generation |
| PDF.js | PDF text extraction |
| Tesseract.js | OCR for scanned PDFs |
| React Markdown | Markdown rendering |
| KaTeX | Mathematical expression rendering |

## Features

### Authentication
- User registration and login.
- Supabase-managed authentication sessions.
- User-specific data access.

### Study Materials
- PDF and TXT uploads.
- Private cloud file storage.
- TXT text extraction.
- PDF text extraction using PDF.js.
- OCR for scanned PDFs using Tesseract.js.
- Rename and delete uploaded materials.
- Persistent document metadata and extracted text.

### AI Summaries
- AI-powered summary generation using Groq.
- Server-side API requests through Supabase Edge Functions.
- Summary persistence in PostgreSQL.
- Editable summaries.
- Markdown formatting for headings, lists and tables.
- Mathematical expression rendering with KaTeX.

### Planned Features
- AI-generated flashcards.
- Interactive flashcard review.
- AI-generated quizzes.
- Quiz scoring and attempt history.
- Expanded learning-progress tracking.

## Architecture

```text
                  ┌─────────────────────┐
                  │     React + Vite    │
                  │     TypeScript      │
                  └──────────┬──────────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
        ┌────────▼────────┐    ┌─────────▼────────┐
        │ Supabase Auth   │    │ Supabase Storage │
        │                 │    │                  │
        └─────────────────┘    └──────────────────┘
                 │
        ┌────────▼────────┐
        │ Supabase        │
        │ PostgreSQL      │
        └─────────────────┘
                 │
        ┌────────▼────────┐
        │ Supabase Edge   │
        │ Functions       │
        └────────┬───────┘
                 │
        ┌────────▼────────┐
        │    Groq API     │
        │  AI Summaries   │
        └─────────────────┘

PDF Processing:
PDF.js → Text Extraction
Tesseract.js → OCR for Scanned PDFs
```

## Database

Mindora uses Supabase PostgreSQL.

Current database tables include:

| Table | Purpose |
|---|---|
| `profiles` | User profile information |
| `study_materials` | Uploaded documents and extracted text |
| `summaries` | AI-generated summaries |
| `flashcard_decks` | Flashcard collections |
| `flashcards` | Individual flashcards |
| `quizzes` | Quiz records |
| `quiz_questions` | Individual quiz questions |
| `quiz_question_answers` | Question-answer records |
| `quiz_attempts` | Quiz attempts and results |

Row Level Security (RLS) is used to protect user-specific records.

## Project Structure

```text
Mindora-AI/
├── Frontend/
│   └── Frontend/
│       ├── src/
│       │   ├── lib/
│       │   │   └── supabase.ts
│       │   ├── App.tsx
│       │   └── Auth.tsx
│       ├── .env
│       ├── package.json
│       └── vite.config.ts
└── README.md
```

*The structure may evolve as development continues.*

## Local Development

### Prerequisites

- Node.js
- npm
- A Supabase project
- A Groq API key

### 1. Clone the repository

```bash
git clone https://github.com/Prathyush2912/Mindora-AI.git
cd Mindora-AI/Frontend/Frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the frontend directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The Groq API key must be configured as a Supabase Edge Function secret. It must never be exposed in frontend environment variables.

### 4. Start the development server

```bash
npm run dev
```

### 5. Create a production build

```bash
npm run build
```

## Security

- Environment files are excluded from Git.
- Private API keys are kept server-side.
- Supabase Row Level Security protects user data.
- Uploaded files are stored in a private storage bucket.
- File access is restricted through authenticated ownership policies.
- Service-role credentials are never exposed to the frontend.

## Development Status

| Component | Status |
|---|---|
| React frontend | Implemented |
| Authentication | Implemented |
| PDF/TXT uploads | Implemented |
| PDF text extraction | Implemented |
| Scanned PDF OCR | Implemented |
| Study-material management | Implemented |
| Groq AI summaries | Implemented |
| Summary persistence | Implemented |
| Markdown and KaTeX rendering | Implemented |
| Flashcards | Planned |
| Quizzes | Planned |
| Learning progress tracking | Planned |
| Production deployment | Pending |

## Roadmap

- [x] Build the React frontend foundation
- [x] Implement authentication
- [x] Integrate Supabase
- [x] Implement PDF and TXT uploads
- [x] Add PDF text extraction
- [x] Add OCR for scanned PDFs
- [x] Integrate Groq AI summaries
- [x] Add summary persistence
- [x] Implement Markdown and mathematical rendering
- [ ] Develop flashcard generation and review
- [ ] Develop quiz generation and scoring
- [ ] Expand learning-progress tracking
- [ ] Deploy the application

## Project Information

**Name:** Mindora  
**Type:** Personal Software Development Project  
**Focus:** Full-Stack Development, AI Integration and Document Processing  
**Repository:** [Mindora-AI](https://github.com/Prathyush2912/Mindora-AI)

---

*Built as an exploration of how AI and software engineering can improve the way students interact with learning materials.*
