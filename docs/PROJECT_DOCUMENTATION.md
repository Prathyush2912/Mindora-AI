# Mindora AI — Project Documentation

> **Mindora — Your Personal AI Learning Platform**

Mindora AI is a learning platform designed to help students turn their study materials into useful learning resources. The project aims to bring note organization, AI-assisted study tools, and learning progress into one place.

This document describes the project, its intended architecture, the current prototype, and the planned development work. It distinguishes features demonstrated in the Figma-generated frontend prototype from integrations that still need to be implemented.

## 1. Project goals

Mindora aims to help students:
- Organize their study materials.
- Review content using concise summaries.
- Practise with quizzes.
- Study with flashcards.
- Track learning activity and quiz performance.

The long-term goal is to provide a simple, consistent study workflow rather than requiring students to use several separate tools.

## 2. Technology

| Technology | Role | Status |
|---|---|---|
| Figma / Figma Make | UI design and generation of the frontend prototype | Used for the current design/prototype |
| React | Component-based frontend interface | Used in the frontend projects |
| Vite | Frontend development server and build tooling | Used in the existing frontend scaffold and Figma project |
| Supabase | Database and planned application data services | Selected for the database; integration and schema should be confirmed with the database owner |
| Gemini API | Planned AI service for learning-content generation | Planned; not connected in the current UI prototype |
| Express / Node.js | Planned server-side API layer for secure AI requests and file processing | Planned; verify implementation before treating as complete |

**Important:** Figma is used to design and generate the frontend. Supabase is the selected database platform. They serve different roles in the system.

## 3. Main product features

The Figma-generated prototype contains screens for the following areas:

### Dashboard
A central overview of the student's study activity and shortcuts to the main study tools.

### Study notes
A notes area with sample notes, search/filter interactions, and note-management actions in the prototype.

### AI summaries
A screen for reviewing and editing summary content. The current prototype simulates the generation flow; it does not yet send content to Gemini.

### Flashcards
A flashcard study interface with sample cards and interactions such as flipping cards and marking them as learned.

### Quizzes
A quiz interface with sample questions, answer selection, and a results flow. The current questions and results are local prototype data.

### Progress
A view of example learning statistics. The displayed figures are sample data until connected to real student activity.

### Settings
A settings interface with local prototype controls. Persistent account settings require backend integration.

## 4. Current implementation status

The following table is intended to prevent prototype interactions from being mistaken for completed backend functionality.

| Area | Current state |
|---|---|
| Figma UI | Generated prototype has dashboard, notes, summaries, flashcards, quizzes, progress, and settings screens |
| Navigation | Works locally in the React prototype |
| Notes | Uses local React state and sample data |
| File upload | Prototype reads the selected file name and adds a sample note; actual file storage and processing are not implemented |
| Summary generation | Simulated in the prototype; Gemini integration is not implemented |
| Flashcards | Uses sample/local data; database persistence is not implemented |
| Quizzes | Uses sample/local questions; saving attempts and scores is not implemented |
| Progress | Uses example statistics; live analytics are not connected |
| Supabase | Selected database platform; confirm schema, authentication, storage, and frontend integration with the teammate responsible for the database |
| Production deployment | Not documented as complete |

The Figma-generated UI and the existing GitHub frontend scaffold are separate project copies at the time this document was prepared. The Figma interface still needs to be integrated into the existing repository frontend. Do not assume that all prototype files are already committed to GitHub.

## 5. High-level architecture

The intended application flow is:

1. The student uses the React frontend.
2. The frontend provides the study interface and sends authorized requests to application services.
3. Supabase is used for the application's database and, where configured, authentication and file storage.
4. A server-side API layer is intended to handle operations that require protected credentials, including requests to Gemini.
5. The AI service processes supported study content and returns generated learning material.
6. The application stores and retrieves relevant records so students can return to their notes, summaries, flashcards, quizzes, and progress.

### Security principles

- Never place a private Gemini API key in frontend code or expose it in browser-delivered environment variables.
- Validate uploaded file types and sizes on the server before processing.
- Apply appropriate authentication and Supabase Row Level Security (RLS) policies before storing student-specific data.
- Keep secrets in server-side environment variables.
- Do not commit environment files or credentials to GitHub.

## 6. Supabase database design (proposed)

Supabase is the selected database platform. The following is a **proposed starting schema** for the MVP, not a record of tables that already exist. The teammate responsible for database architecture should review and approve the table names, column types, relationships, and policies before implementation.

### Proposed tables

| Table | Purpose | Suggested fields |
|---|---|---|
| `profiles` | App profile linked to a Supabase Auth user | `id` (UUID, matches auth user ID), `display_name`, `created_at`, `updated_at` |
| `study_materials` | Uploaded study files and their metadata | `id`, `user_id`, `title`, `file_name`, `file_type`, `storage_path`, `status`, `created_at` |
| `summaries` | AI-generated summaries for study materials | `id`, `user_id`, `study_material_id`, `title`, `content`, `created_at`, `updated_at` |
| `quizzes` | Quiz information associated with a study material | `id`, `user_id`, `study_material_id`, `title`, `created_at` |
| `quiz_questions` | Individual questions belonging to a quiz | `id`, `quiz_id`, `question_text`, `options`, `correct_answer`, `explanation`, `position` |
| `quiz_attempts` | A student's completed quiz attempt and result | `id`, `user_id`, `quiz_id`, `score`, `total_questions`, `completed_at` |
| `flashcard_decks` | A collection of flashcards | `id`, `user_id`, `study_material_id`, `title`, `created_at` |
| `flashcards` | Individual question-and-answer cards | `id`, `deck_id`, `front`, `back`, `position`, `created_at` |

These fields are suggestions only. For example, the team may choose JSONB for quiz options, a different status model for uploaded files, or additional fields for tracking flashcard review activity. Decide column types, constraints, indexes, and deletion behavior during schema review.

### Proposed relationships

- One authenticated user has one profile.
- One user can own many study materials.
- One study material can have multiple summaries, quizzes, and flashcard decks.
- One quiz contains multiple quiz questions.
- One user can have multiple attempts for a quiz.
- One flashcard deck contains multiple flashcards.

Use foreign keys to enforce the approved relationships. Confirm whether deleting a study material should also delete its generated content, or whether the app should preserve that content.

### Security and storage considerations

- Link user-owned records to the authenticated Supabase user ID.
- Enable Row Level Security (RLS) on tables containing user data.
- Add policies so users can only read and modify records they are authorized to access.
- If Supabase Storage is used for uploaded files, keep files in a private bucket and use policies that restrict access to the file owner.
- Store a storage path and metadata in the database rather than placing file contents directly in a table.
- Never expose service-role keys in the frontend.

### Approval status

**Status: Proposed — not yet confirmed against the live Supabase project.**

The database owner should compare this proposal with the existing Supabase project before creating, renaming, or changing any tables. Once the real schema is confirmed, replace this proposal with the actual table definitions, relationships, indexes, and RLS policies.

## 7. Frontend development notes

The Figma-generated frontend is a React + TypeScript prototype. Its entry point mounts the main App component and imports the global stylesheet. Its Vite configuration includes React and Tailwind CSS 4 support, along with Figma-specific preview plugins.

The existing repository frontend scaffold was created with React + Vite and uses JavaScript files such as:
- src/App.jsx
- src/main.jsx
- src/App.css
- src/index.css

The Figma project uses TypeScript files such as App.tsx and main.tsx. React can support JavaScript and TypeScript modules in the same project when the build configuration and dependencies are set up correctly, but the integration should be tested rather than assumed.

### Frontend integration guidelines

- Preserve the existing GitHub repository and project history.
- Treat the Figma-generated interface as the design and UI source of truth unless the team agrees to a design change.
- Inspect imports and assets before moving components.
- Add only the dependencies and Vite configuration actually required by the integrated frontend.
- Keep the UI prototype functional while replacing sample/local data with real services incrementally.
- Test the production build after integration.

## 8. Suggested development sequence

1. Integrate the Figma-generated frontend into the existing React + Vite repository.
2. Verify the app runs and builds successfully.
3. Review the approved Supabase schema and authentication/storage approach with the database owner.
4. Connect the frontend to Supabase using the agreed schema and security policies.
5. Implement the server-side API layer for protected AI operations.
6. Connect study-material processing and summary generation to Gemini.
7. Persist flashcards, quizzes, attempts, and progress.
8. Add validation, loading states, error handling, and tests.
9. Prepare deployment and production configuration.

## 9. Working agreements

- Frontend development and UI integration are handled separately from database architecture.
- Coordinate database changes with the teammate responsible for Supabase.
- Agree on API contracts and data shapes before connecting frontend components.
- Keep credentials and private keys out of source control.
- Update this document when implementation status, architecture, or database schema changes.
- Label features as **planned**, **prototype**, or **implemented** accurately.

## 10. Repository documentation maintenance

This file is the project-level technical overview. As the project grows, consider adding focused documents such as:
- docs/FRONTEND.md — frontend structure, components, and local development
- docs/DATABASE.md — confirmed Supabase schema, relationships, and RLS policies
- docs/API.md — backend endpoints, request/response contracts, and error formats
- docs/CONTRIBUTING.md — development workflow and contribution guidelines

Only add details to those documents after the corresponding implementation or design has been verified.

---

**Document status:** Initial project documentation  
**Last updated:** 2026-11-23  
**Maintainers:** Mindora AI project team
