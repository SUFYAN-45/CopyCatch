# CopyCatch

An intelligent plagiarism and textual similarity detection engine powered by semantic vector embeddings and lexical n-gram analysis.

**Phase 4 complete — Plagiarism & Similarity Detection Engine.**

See [docs/PROJECT_STATE.md](docs/PROJECT_STATE.md) for current status and architecture details.

---

## Important Notice & Objective Classification
CopyCatch is an **algorithmic similarity-detection system**, not an infallible academic judge. It identifies textual overlaps, paraphrasing patterns, and semantic correspondence against an indexed reference corpus. Final determinations of academic integrity or intentional plagiarism require human evaluation.

---

## Core Detection Architecture

### 1. Supported Document Formats
- **Plain Text (`.txt`)**: UTF-8 decoding with Latin-1 fallback.
- **Portable Document Format (`.pdf`)**: Page-by-page text extraction via `pypdf`.
- **Microsoft Word (`.docx`)**: Paragraph and table content extraction via `python-docx`.

### 2. Multi-Stage Pipeline
```text
Uploaded Document (.txt, .pdf, .docx)
       │
       ▼
[1. File Validation & Sanitization] (path traversal defense, magic bytes, size limits)
       │
       ▼
[2. Document Text Extraction] (pypdf, python-docx, utf-8/latin-1)
       │
       ▼
[3. Preprocessing & Chunking] (normalization, sentence sliding windows, offset tracking)
       │
       ▼
[4. Multi-Modal Similarity Engine]
  ├── Semantic Similarity: all-MiniLM-L6-v2 embeddings (384-dim) & cosine similarity
  └── Lexical Similarity: Scikit-learn TF-IDF n-grams (1-3) & word containment
       │
       ▼
[5. Calibrated Hybrid Scoring]
  Formula: (0.60 * Semantic) + (0.40 * Lexical) -> Clamped 0.0 to 100.0%
       │
       ▼
[6. Passage Match Extraction & Report] (deduplicated passages with offsets and snippets)
       │
       ▼
Persisted JSON Report (backend/data/reports/analysis_<id>.json)
```

### 3. Similarity Categories
Results are mapped into clear, objective categories:
| Score Range | Category | Description |
| :--- | :--- | :--- |
| **0 – 20%** | Very Low Similarity | Negligible overlap; original phrasing. |
| **21 – 40%** | Low Similarity | Minor incidental phrase sharing or common terminology. |
| **41 – 60%** | Moderate Similarity | Partial paraphrase or localized matched passages detected. |
| **61 – 80%** | High Similarity | Substantial textual and semantic correspondence found. |
| **81 – 100%** | Very High Similarity | Near-verbatim or extensive conceptual replication detected. |

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Service health status. |
| `POST` | `/api/v1/analyze` | Upload a document (`multipart/form-data`) and execute analysis. |
| `GET` | `/api/v1/analysis/{id}` | Retrieve persisted analysis JSON report by `analysis_id`. |
| `POST` | `/api/v1/references` | Upload a new reference document to the corpus. |
| `GET` | `/api/v1/references` | List all indexed reference documents. |
| `DELETE` | `/api/v1/references/{filename}` | Remove a reference document from the corpus. |

Interactive API documentation is accessible at:
- **Swagger UI:** `http://127.0.0.1:8000/docs`
- **ReDoc:** `http://127.0.0.1:8000/redoc`

---

## Running the Backend (Local Development)

1. Activate your virtual environment:
   ```powershell
   cd backend
   .\.venv\Scripts\activate
   ```

2. Start the FastAPI development server:
   ```powershell
   uvicorn app.main:app --reload
   ```

3. **Model Download on First Run**:
   On first invocation, Sentence Transformers automatically downloads the compact `all-MiniLM-L6-v2` model (~80 MB) and caches it locally under `~/.cache/huggingface/`. All subsequent runs execute completely offline from disk.
