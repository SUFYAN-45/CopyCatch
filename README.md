# CopyCatch

An intelligent plagiarism detection platform powered by semantic and lexical analysis.

Phase 3 complete — MongoDB Removed & Local File Storage Foundation.

See [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md) for current status and architecture details.

---

## Architecture & Storage Overview

### Mini-Project Direction
CopyCatch is optimized for fast mini-project development. To accelerate delivery of the core plagiarism-detection engine without operational friction:
- **MongoDB and MongoDB Atlas have been completely removed.**
- **No external database is required** (no Supabase, PostgreSQL, SQLite, or Firebase).
- **Persistence uses lightweight local file storage** under `backend/data/`:
  - `uploads/`: Stores submitted files during analysis.
  - `reference_documents/`: Stores reference corpus documents against which inputs are compared.
  - `reports/`: Stores analysis outcomes as lightweight JSON files (`analysis_<id>.json`).

### Next Major Phase
The next priority is building the actual **CopyCatch NLP and Plagiarism Detection Engine** (text extraction, normalization, chunking, semantic & lexical similarity, and hybrid scoring).

---

## Running the Backend (Local Development)

1. Navigate to the backend directory and activate your virtual environment:
   ```bash
   cd backend
   .\.venv\Scripts\activate
   ```

2. (Optional) Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
   *(No database credentials or external service tokens are needed!)*

3. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload
   ```

4. Endpoints & Documentation:
   - Interactive Swagger UI: `http://127.0.0.1:8000/docs`
   - ReDoc UI: `http://127.0.0.1:8000/redoc`
   - Service Health Check: `http://127.0.0.1:8000/api/v1/health`
