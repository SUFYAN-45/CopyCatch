import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120_000,
});

// ── Types ────────────────────────────────────────────────────────────────────

export interface Match {
  source: string;
  submitted_text: string;
  matched_text: string;
  similarity_score: number;
  match_type: 'semantic' | 'lexical' | 'hybrid';
  location: Record<string, unknown> | null;
}

export interface AnalysisResult {
  analysis_id: string;
  document_id: string | null;
  document: {
    filename: string;
    size: number;
    word_count?: number;
    char_count?: number;
  } | null;
  overall_similarity: number;
  semantic_similarity: number;
  lexical_similarity: number;
  classification: string;
  matches: Match[];
  analyzed_at: string;
  message: string | null;
}

export interface ReferenceDoc {
  filename: string;
  size: number;
  modified_at: string;
}

// ── Analysis ─────────────────────────────────────────────────────────────────

export async function analyzeDocument(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<AnalysisResult> {
  const form = new FormData();
  form.append('file', file);

  const { data } = await api.post<AnalysisResult>('/analyze', form, {
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });
  return data;
}

export async function getAnalysisById(id: string): Promise<AnalysisResult> {
  const { data } = await api.get<AnalysisResult>(`/analysis/${id}`);
  return data;
}

// ── References ───────────────────────────────────────────────────────────────

export async function listReferences(): Promise<ReferenceDoc[]> {
  const { data } = await api.get<ReferenceDoc[]>('/references');
  return data;
}

export async function uploadReference(file: File): Promise<{ message: string; filename: string; size: number }> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post('/references', form);
  return data;
}

export async function deleteReference(filename: string): Promise<{ message: string }> {
  const { data } = await api.delete(`/references/${encodeURIComponent(filename)}`);
  return data;
}

// ── Health ───────────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<boolean> {
  try {
    await api.get('/health');
    return true;
  } catch {
    return false;
  }
}
