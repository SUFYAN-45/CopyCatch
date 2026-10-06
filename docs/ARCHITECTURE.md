# CopyCatch — System Architecture

> **Notice:** CopyCatch is intentionally designed and optimized as a focused **mini project**. All external database systems (including MongoDB and MongoDB Atlas) have been completely removed to prioritize fast, frictionless delivery of the actual plagiarism-detection product.

---

## 1. High-Level Technology Stack

### Frontend
- **Framework & Core:** React, TypeScript, Vite *(Scheduled for future UI phase)*
- **Styling & Components:** Tailwind CSS, shadcn/ui

### Backend
- **Core Runtime & API:** Python 3.13, FastAPI
- **Architecture:** Lightweight service-oriented architecture with clean boundaries:
  - `api/`: API router aggregation and HTTP endpoints (`/health`).
  - `core/`: Configuration via Pydantic Settings (`app/core/config.py`).
  - `models/`: Internal domain models.
  - `schemas/`: Pydantic schemas for data validation (`DocumentMetadata`, `Match`, `AnalysisResult`).
  - `services/`: Dedicated business logic divided into:
    - `document/`: File ingestion and text extraction (`.txt`, `.pdf`, `.docx`).
    - `nlp/`: Text normalization and token/sentence chunking.
    - `plagiarism/`: Semantic, lexical, and hybrid scoring engine.
    - `storage/`: Lightweight local filesystem storage.
  - `utils/`: Utilities for filename sanitization, safe validation, and security guards.

### Storage & Persistence
- **Storage Type:** Lightweight Local Filesystem Storage (`backend/data/`).
- **External Database:** **None.** (No MongoDB, Supabase, PostgreSQL, SQLite, or Firebase required).
- **Directory Layout:**
  - `backend/data/uploads/`: Stores submitted files for analysis (git-ignored).
  - `backend/data/reference_documents/`: Stores reference corpus documents (git-ignored).
  - `backend/data/reports/`: Stores analysis outcomes as standalone JSON files (`analysis_<id>.json`, git-ignored).
- **Service Layer:** `LocalStorageService` (`app/services/storage/local_storage.py`) providing a clean, replaceable file management layer.

### Upcoming NLP & Plagiarism Detection Engine
- **Embedding Models:** Sentence Transformers (`all-mpnet-base-v2`) for dense semantic embeddings.
- **Lexical Matching:** N-gram overlap, Jaccard similarity, and TF-IDF vectors via scikit-learn.
- **Scoring Aggregator:** Calibrated hybrid scoring combining semantic and lexical similarities.

---

## 2. Planned Pipeline & Subsystems

The core CopyCatch detection workflow operates across five explicit service boundaries:

```text
Uploaded File (.txt, .pdf, .docx)
       │
       ▼
[1. File Validation & Sanitization] (backend/app/utils/file_validation.py)
       │
       ▼
[2. Document Extraction] (backend/app/services/document/extractor.py)
       │
       ▼
[3. Text Normalization & Chunking] (backend/app/services/nlp/preprocessor.py)
       │
       ▼
[4. Hybrid Similarity Analysis] (backend/app/services/plagiarism/detector.py)
  ├── Semantic Similarity (Dense Vector Embeddings)
  └── Lexical Similarity (Jaccard / N-Gram Overlap)
       │
       ▼
[5. Report Generation & Local Storage] (backend/app/services/storage/local_storage.py)
       │
       ▼
Persisted JSON Report (backend/data/reports/analysis_<id>.json)
```

1. **Document Ingestion & Validation**
   - Validates file size, extension, and content headers for `.txt`, `.pdf`, `.docx`.
   - Sanitizes untrusted user filenames to prevent directory traversal and injection.

2. **Document Extraction**
   - Plain text decoding for `.txt`.
   - Multi-format extraction engines for `.pdf` and `.docx` scheduled for the upcoming NLP engine phase.

3. **Text Preprocessing & Chunking**
   - Normalizes whitespace, casing, and irregular characters.
   - Chunks lengthy documents into overlapping windows to detect localized plagiarism passages.

4. **Hybrid Plagiarism Scoring**
   - Calculates lexical similarity for verbatim phrase copying.
   - Calculates semantic similarity for paraphrased or rewritten content.
   - Blends signals into a single calibrated similarity score between 0.0 and 1.0.

5. **Local Report Generation**
   - Produces structured, validated `AnalysisResult` JSON objects with fine-grained match snippets.
   - Persists analysis artifacts directly to local disk for retrieval.
