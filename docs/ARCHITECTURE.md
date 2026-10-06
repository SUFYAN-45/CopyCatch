# CopyCatch — System Architecture

> **Notice:** CopyCatch is an algorithmic plagiarism and similarity detection system optimized as a lightweight, fast-moving mini project. It operates completely with local filesystem storage and requires no external databases or distributed processing infrastructure.

---

## 1. High-Level Technology Stack

### Backend
- **Core Runtime & API:** Python 3.13, FastAPI, Uvicorn
- **Architecture:** Layered service-oriented architecture with clean boundaries:
  - `api/`: Endpoint routers (`health.py`, `analysis.py`, `references.py`).
  - `core/`: Configuration via Pydantic Settings (`app/core/config.py`).
  - `schemas/`: Pydantic validation models (`DocumentMetadata`, `Match`, `AnalysisResult`, `ReferenceDocumentInfo`).
  - `services/`: Dedicated business domain services:
    - `document/`: File parsing and text extraction (`extractor.py`).
    - `nlp/`: Text cleaning, normalization, and sentence chunking (`preprocessor.py`).
    - `nlp/`: Dense vector embeddings via Sentence Transformers (`semantic.py`).
    - `plagiarism/`: TF-IDF and n-gram lexical analysis (`lexical.py`).
    - `plagiarism/`: Hybrid scoring and match detection (`detector.py`).
    - `plagiarism/`: Full-pipeline orchestration service (`service.py`).
    - `storage/`: Local disk management for uploads, references, and reports (`local_storage.py`).
  - `utils/`: Path sanitization and binary magic-byte validation (`file_validation.py`).

### NLP & Machine Learning Engine
- **Dense Semantic Embeddings:** Sentence Transformers model `all-MiniLM-L6-v2` (384-dimensional dense vectors, normalized for dot-product cosine similarity). Loaded as an in-memory singleton.
- **Lexical & N-Gram Matching:** Scikit-learn `TfidfVectorizer` (sublinear term frequency, word 1-3 grams) combined with word 3-gram containment.
- **Document Extractors:** `pypdf` for PDF parsing; `python-docx` for DOCX parsing; standard library UTF-8 / Latin-1 fallback for plain text.

### Persistence & Storage
- **Storage Strategy:** Local Filesystem (`backend/data/`):
  - `uploads/`: Ingested document files.
  - `reference_documents/`: Reference corpus documents.
  - `reports/`: Standalone JSON analysis reports (`analysis_<id>.json`).
- **External Database:** **None** (No MongoDB, Supabase, PostgreSQL, SQLite, or Firebase required).

---

## 2. Plagiarism Detection Pipeline

The detection workflow proceeds through six coordinated stages:

```text
Uploaded Document (.txt, .pdf, .docx)
       │
       ▼
[1. File Validation & Sanitization] (backend/app/utils/file_validation.py)
       │
       ▼
[2. Document Text Extraction] (backend/app/services/document/extractor.py)
       │
       ▼
[3. Text Preprocessing & Chunking] (backend/app/services/nlp/preprocessor.py)
       │
       ▼
[4. Multi-Modal Similarity Engine]
  ├── Semantic Similarity: all-MiniLM-L6-v2 embeddings & cosine similarity (backend/app/services/nlp/semantic.py)
  └── Lexical Similarity: TF-IDF n-grams & word containment (backend/app/services/plagiarism/lexical.py)
       │
       ▼
[5. Calibrated Hybrid Scoring & Match Extraction] (backend/app/services/plagiarism/detector.py)
       │
       ▼
[6. Report Generation & Local Storage] (backend/app/services/plagiarism/service.py)
       │
       ▼
Persisted JSON Report (backend/data/reports/analysis_<id>.json)
```

### Stage Details

1. **Document Ingestion & Validation (`file_validation.py`)**
   - Strips directory traversal patterns (`../`, `..\`), controls characters, and guards against Windows reserved device names (`CON`, `PRN`, etc.).
   - Verifies file size against configured limit (default: 15 MB).
   - Validates content headers (`%PDF-` for PDF, `PK\x03\x04` for DOCX).

2. **Document Extraction (`extractor.py`)**
   - Extracts plain text from `.txt`, `.pdf`, and `.docx` without modifying source files.
   - Throws clear exceptions (`DocumentEmptyError`, `DocumentExtractionError`, `UnsupportedFormatError`) with descriptive HTTP error codes.

3. **Preprocessing & Sentence Windowing (`preprocessor.py`)**
   - Produces clean semantic text and normalized lexical text.
   - Groups sentences into overlapping windows (~50 words target, 1 sentence overlap) encapsulated in `TextChunk` dataclasses with character offset tracking.

4. **Multi-Modal Similarity Analysis**
   - **Semantic Similarity (`semantic.py`):** Calculates chunk-level dense vector representations using `all-MiniLM-L6-v2`. Uses matrix dot product for efficient batch cosine similarity.
   - **Lexical Similarity (`lexical.py`):** Calculates whole-document TF-IDF cosine similarity and chunk-level n-gram containment to capture verbatim or lightly modified phrasing.

5. **Hybrid Scoring & Passage Matching (`detector.py`)**
   - Combines semantic and lexical scores using configurable weights:
     $$\text{Hybrid Score} = (w_{\text{sem}} \times \text{Semantic}) + (w_{\text{lex}} \times \text{Lexical})$$
     *(Defaults: $w_{\text{sem}} = 0.60$, $w_{\text{lex}} = 0.40$, scaled to 0.0–100.0%).*
   - Categorizes score into objective ranges (Very Low, Low, Moderate, High, Very High).
   - Identifies candidate matches exceeding threshold (default: 50.0%), tags match type (`"semantic"`, `"lexical"`, or `"hybrid"`), deduplicates overlapping matches, and retains Top-K passages.

6. **Orchestration & Reporting (`service.py`)**
   - Coordinates the pipeline, caches reference document representations in memory during runtime, guards against self-comparison, and persists the resulting `AnalysisResult` as a JSON report.
