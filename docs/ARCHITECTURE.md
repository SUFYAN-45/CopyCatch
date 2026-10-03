# CopyCatch — System Architecture

> **Notice:** This document outlines the intended clean-slate architecture for CopyCatch. These systems and components are architectural specifications and are **not implemented yet**.

---

## 1. High-Level Technology Stack

### Frontend
- **Framework & Core:** React, TypeScript, Vite
- **Styling & Components:** Tailwind CSS, shadcn/ui
- **Motion & 3D Experience:** Framer Motion, React Three Fiber, Drei

### Backend
- **Core Runtime & API:** Python, FastAPI
- **Architecture:** Modular, layered service architecture (routers, services, repositories, schemas)

### NLP & AI Pipeline
- **Embedding Models:** Sentence Transformers (`all-mpnet-base-v2`)
- **Machine Learning & Classical NLP:** scikit-learn
- **Text Preprocessing & Linguistic Analysis:** NLTK / spaCy (where appropriate)

### Database & Persistence
- **Database:** MongoDB
- **Driver:** Appropriate asynchronous MongoDB driver (e.g., Motor)

### Authentication & Authorization
- **Security Mechanism:** JSON Web Tokens (JWT) with secure password hashing (e.g., Argon2 / bcrypt)
- **Role-Based Access Control (RBAC):**
  - Student
  - Faculty
  - Admin

---

## 2. Planned Pipeline & Subsystems (Future Implementation)

The following capabilities are specified for future phases:

1. **Document Ingestion & Extraction**
   - Text extraction across varied file formats (PDF, DOCX, TXT).
   - Sanitization and encoding normalization.

2. **Chunking & Preprocessing**
   - Context-preserving token and sentence chunking strategies.
   - Stopword handling, lemmatization, and n-gram extraction where suitable.

3. **Multi-Stage Detection Engine**
   - **Semantic Similarity:** Dense vector embeddings generated via `all-mpnet-base-v2` and cosine similarity analysis.
   - **Lexical Matching:** TF-IDF, character/token n-gram overlap, and Jaccard similarity metrics via scikit-learn.
   - **Exact Phrase Matching:** Substring matching and Karp-Rabin / rolling hash algorithms for identical passage identification.
   - **Hybrid Scoring:** Weighted algorithmic aggregation blending lexical, exact, and semantic signals into confidence-calibrated similarity scores.

4. **Reference Corpus & Storage**
   - Persistent index of internal institutional documents, submitted academic works, and indexed reference papers.

5. **Source Attribution & Evidence Alignment**
   - Granular sentence- and paragraph-level source attribution.
   - Side-by-side textual alignment and highlight visualizer.

6. **Reporting & Analytics**
   - Comprehensive plagiarism breakdown reports with similarity indices and source links.
   - Exportable audit logs and academic integrity summaries.

7. **Research Evaluation**
   - Evaluation harness for benchmarking against standard plagiarism detection datasets.
   - Precision, recall, and F1-score evaluation metrics across paraphrase variations.
