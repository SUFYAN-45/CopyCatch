# CopyCatch

An intelligent plagiarism detection platform powered by semantic and lexical analysis.

Phase 2 complete — MongoDB Foundation.

See [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md) for current status and architecture details.

---

## Database Overview (Beginner Guide)

### What MongoDB is
MongoDB is the NoSQL document database used by CopyCatch to store and manage application data (such as future user accounts, reference documents, and analysis records).

### What MongoDB Atlas is
MongoDB Atlas is the official fully-managed cloud database service for MongoDB. CopyCatch uses MongoDB Atlas for development so that developers do not need to install, configure, or run MongoDB Server locally on their machines.

### Why CopyCatch uses it
It provides reliable, persistent cloud storage accessible via a secure connection string, keeping development lightweight and seamless across environments.

### Current Phase 2 Scope
Phase 2 establishes only the core **database infrastructure** (client lifecycle, connection verification, and health check endpoints). Application-specific collections (users, documents, plagiarism reports, etc.) will be introduced in subsequent phases.

---

## Running the Backend (Local Development)

1. Activate your virtual environment and configure your local `.env`:
   ```bash
   cd backend
   copy .env.example .env
   # Add your MongoDB Atlas connection string to MONGODB_URI in backend/.env
   ```

2. Start the FastAPI development server:
   ```bash
   .\.venv\Scripts\uvicorn.exe app.main:app --reload
   ```

3. Endpoints & Documentation:
   - Interactive Swagger UI: `http://127.0.0.1:8000/docs`
   - Service Health Check: `http://127.0.0.1:8000/api/v1/health`
   - Database Health Check: `http://127.0.0.1:8000/api/v1/health/database`
