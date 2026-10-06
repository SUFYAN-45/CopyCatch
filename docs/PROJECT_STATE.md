# CopyCatch Project State

## Project Details
- **Project:** CopyCatch
- **Project Root:** D:\NLP project
- **Current Phase:** Phase 4 — Core Plagiarism & Similarity Detection Engine
- **Status:** COMPLETE
- **Project Context:** Clean-slate project created from scratch. Fully functional algorithmic plagiarism detection engine operating with local filesystem storage and zero external database dependencies.

## Subsystem Implementation Status
- **Frontend:** Not implemented yet (Scheduled for upcoming frontend phase).
- **Backend:** Core detection engine fully operational (FastAPI, Sentence Transformers, Scikit-learn, pypdf, python-docx).
  - **Entry Point:** `backend/app/main.py` (`app.main:app`)
  - **Configuration:** `backend/app/core/config.py` (Pydantic Settings with local storage directories, upload limits, model settings, and classification categories)
  - **API Endpoints:**
    - Service Health: `GET /api/v1/health`
    - Document Analysis: `POST /api/v1/analyze`
    - Report Retrieval: `GET /api/v1/analysis/{analysis_id}`
    - Reference Corpus Management: `POST /api/v1/references`, `GET /api/v1/references`, `DELETE /api/v1/references/{filename}`
  - **Interactive Docs:** `/docs` (Swagger UI) and `/redoc` (ReDoc)
  - **Automated Tests:** 63 tests (63 passed, 0 failed, 0 skipped)
- **Document Extraction Engine (`app/services/document/extractor.py`):**
  - Plain Text: `.txt` (UTF-8 with Latin-1 fallback)
  - Portable Document Format: `.pdf` (via `pypdf.PdfReader` with page-by-page extraction)
  - Word Processing: `.docx` (via `docx.Document` paragraphs and tables)
  - Exception Handling: `DocumentEmptyError`, `DocumentExtractionError`, `UnsupportedFormatError`
- **NLP & Similarity Engines:**
  - **Preprocessing (`app/services/nlp/preprocessor.py`):** Whitespace/character normalization, lexical cleaning, and sentence sliding window chunking with offset tracking.
  - **Semantic Engine (`app/services/nlp/semantic.py`):** Dense vector embeddings using cached `all-MiniLM-L6-v2` singleton and cosine matrix dot-product similarity.
  - **Lexical Engine (`app/services/plagiarism/lexical.py`):** Sublinear TF-IDF word 1-3 grams and word 3-gram containment.
  - **Hybrid Scoring & Matching (`app/services/plagiarism/detector.py`):** Weighted blend (`0.60 * Semantic + 0.40 * Lexical`), 5 objective classification categories, and candidate match deduplication.
  - **Analysis Orchestration (`app/services/plagiarism/service.py`):** Full pipeline coordination, runtime reference caching, self-comparison prevention, and JSON report persistence.
- **Storage & Corpus (`app/services/storage/local_storage.py`):**
  - Local filesystem storage under `backend/data/`:
    - `uploads/`: Stores ingested documents (git-ignored)
    - `reference_documents/`: Stores reference corpus documents (git-ignored)
    - `reports/`: Stores analysis outcomes as standalone JSON files `analysis_<id>.json` (git-ignored)

## Current Project Structure
```text
D:\NLP project\
├── backend\
│   ├── .venv\                     (Python 3.13 virtual environment, git-ignored)
│   ├── app\
│   │   ├── api\
│   │   │   ├── routes\
│   │   │   │   ├── __init__.py
│   │   │   │   ├── analysis.py
│   │   │   │   ├── health.py
│   │   │   │   └── references.py
│   │   │   ├── __init__.py
│   │   │   └── router.py
│   │   ├── core\
│   │   │   ├── __init__.py
│   │   │   └── config.py
│   │   ├── models\
│   │   │   └── __init__.py
│   │   ├── schemas\
│   │   │   ├── __init__.py
│   │   │   ├── analysis.py
│   │   │   └── document.py
│   │   ├── services\
│   │   │   ├── document\
│   │   │   │   ├── __init__.py
│   │   │   │   └── extractor.py
│   │   │   ├── nlp\
│   │   │   │   ├── __init__.py
│   │   │   │   ├── preprocessor.py
│   │   │   │   └── semantic.py
│   │   │   ├── plagiarism\
│   │   │   │   ├── __init__.py
│   │   │   │   ├── detector.py
│   │   │   │   ├── lexical.py
│   │   │   │   └── service.py
│   │   │   ├── storage\
│   │   │   │   ├── __init__.py
│   │   │   │   └── local_storage.py
│   │   │   └── __init__.py
│   │   ├── utils\
│   │   │   ├── __init__.py
│   │   │   └── file_validation.py
│   │   ├── __init__.py
│   │   └── main.py
│   ├── data\
│   │   ├── reference_documents\   (.gitkeep tracked, contents git-ignored)
│   │   ├── reports\               (.gitkeep tracked, contents git-ignored)
│   │   └── uploads\               (.gitkeep tracked, contents git-ignored)
│   ├── tests\
│   │   ├── __init__.py
│   │   ├── test_api_endpoints.py
│   │   ├── test_config.py
│   │   ├── test_extraction.py
│   │   ├── test_file_validation.py
│   │   ├── test_health.py
│   │   ├── test_hybrid_and_matching.py
│   │   ├── test_lexical.py
│   │   ├── test_preprocessing.py
│   │   ├── test_schemas.py
│   │   ├── test_semantic.py
│   │   └── test_storage.py
│   ├── .env.example
│   └── requirements.txt
├── docs\
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT_RULES.md
│   ├── IMPLEMENTATION_LOG.md
│   └── PROJECT_STATE.md
├── frontend\                      (empty directory, awaiting frontend phase)
├── .env.example
├── .gitattributes
├── .gitignore
└── README.md
```

## Environment Versions
- **git:** git version 2.50.1.windows.1
- **python:** Python 3.13.1
- **pip:** pip 26.1
- **node:** v22.19.0
- **npm:** 11.6.0

## Git Checkpoints
- **Phase 0 Checkpoint:**
  - Tag: `phase-0-complete`
  - Commit: `3f29484` (`3f294849bafe880e5ff75d6883d6285e1b5f566c`)
- **Phase 1 Checkpoint:**
  - Tag: `phase-1-complete`
  - Commit: `e9da2e1` (`e9da2e162df210a0c6de81aee7b0301e4234c74a`)
- **Phase 2 Checkpoint:**
  - Tag: `phase-2-complete`
  - Commit: `f258235` (`f2582353e58790c07b2a1f5371d4b9d1b7296c6c`)
- **Phase 3 Checkpoint:**
  - Tag: `phase-3-complete`
  - Commit: `da04687` (`da0468788ec83ad7de777f97d649f979cd361de3`)
- **Phase 4 Checkpoint:**
  - Tag: `phase-4-complete`
  - Commit: `622526d` (`622526d577994a767409e8c31742e2bd87d13a4c`)

## Next Phase
Phase 5 — Modern Web Frontend (React, Vite, Tailwind CSS, Document Upload & Interactive Visualizer).
