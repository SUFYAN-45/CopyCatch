# CopyCatch

An intelligent plagiarism detection platform powered by semantic and lexical analysis.

Phase 1 complete — Backend Foundation.

See [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md) for current status and architecture details.

## Running the Backend (Local Development)

```bash
cd backend
.\.venv\Scripts\uvicorn.exe app.main:app --reload
```

The API documentation will be available at:
- Swagger UI: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/v1/health`
