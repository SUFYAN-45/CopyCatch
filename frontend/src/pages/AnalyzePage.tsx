import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, X, CheckCircle2, Loader2,
  FileText, BookMarked, RefreshCw, Trash2,
  ShieldCheck, Database
} from 'lucide-react';
import {
  analyzeDocument, uploadReference, listReferences, deleteReference,
  type ReferenceDoc,
} from '../services/api';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { recordHistory } from './HistoryPage';

const ACCEPTED_TYPES = {
  'text/plain': ['.txt'],
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

function FileTypeIcon({ name }: { name: string }) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') {
    return (
      <div className="size-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
        <span className="font-mono text-xs font-bold text-rose-400">PDF</span>
      </div>
    );
  }
  if (ext === 'docx') {
    return (
      <div className="size-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
        <span className="font-mono text-xs font-bold text-blue-400">DOCX</span>
      </div>
    );
  }
  return (
    <div className="size-10 rounded-xl bg-zinc-500/10 border border-zinc-500/20 flex items-center justify-center shrink-0">
      <span className="font-mono text-xs font-bold text-zinc-300">TXT</span>
    </div>
  );
}

export default function AnalyzePage() {
  const navigate = useNavigate();
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [refs, setRefs] = useState<ReferenceDoc[]>([]);
  const [refsLoading, setRefsLoading] = useState(true);
  const [refUploading, setRefUploading] = useState(false);
  const [refError, setRefError] = useState<string | null>(null);
  const [deletingRef, setDeletingRef] = useState<string | null>(null);

  // Load reference library
  const loadRefs = useCallback(async () => {
    setRefsLoading(true);
    try {
      const data = await listReferences();
      setRefs(data);
    } catch {
      // Backend might still be starting up
    } finally {
      setRefsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRefs();
  }, [loadRefs]);

  // Target file dropzone (Single file)
  const { 
    getRootProps: getTargetProps, 
    getInputProps: getTargetInputProps, 
    isDragActive: isTargetDragActive 
  } = useDropzone({
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: 15 * 1024 * 1024,
    onDropAccepted: ([file]) => {
      setTargetFile(file);
      setError(null);
    },
    onDropRejected: (rejections) => {
      setError(rejections[0]?.errors[0]?.message ?? 'File rejected. Only PDF, DOCX, or TXT under 15 MB accepted.');
    },
  });

  // Reference files dropzone (Multiple files)
  const { 
    getRootProps: getRefProps, 
    getInputProps: getRefInputProps, 
    isDragActive: isRefDragActive 
  } = useDropzone({
    accept: ACCEPTED_TYPES,
    maxFiles: 10,
    maxSize: 15 * 1024 * 1024,
    onDropAccepted: async (acceptedFiles) => {
      setRefUploading(true);
      setRefError(null);
      for (const file of acceptedFiles) {
        try {
          await uploadReference(file);
        } catch (e: unknown) {
          const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
          setRefError(detail ?? `Failed to upload reference: ${file.name}`);
        }
      }
      await loadRefs();
      setRefUploading(false);
    },
    onDropRejected: (rejections) => {
      setRefError(rejections[0]?.errors[0]?.message ?? 'One or more reference files were rejected.');
    },
  });

  const handleDeleteRef = async (filename: string) => {
    setDeletingRef(filename);
    try {
      await deleteReference(filename);
      setRefs((prev) => prev.filter((r) => r.filename !== filename));
    } catch {
      setRefError('Failed to remove reference document.');
    } finally {
      setDeletingRef(null);
    }
  };

  const handleRunAnalysis = async () => {
    if (!targetFile) return;
    setAnalyzing(true);
    setError(null);
    setUploadProgress(0);

    try {
      const result = await analyzeDocument(targetFile, setUploadProgress);
      recordHistory(result);
      navigate(`/results/${result.analysis_id}`, { state: result });
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail ?? 'Similarity analysis failed. Verify that the backend server is running and models are loaded.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-grid-pattern py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Page Heading & Context */}
        <div className="space-y-2 border-b border-white/[0.06] pb-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
              Analysis Workspace
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Analyze Document
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl">
            Upload one document to compare it against your indexed reference corpus. The NLP engine will calculate semantic embeddings, lexical overlap, and surface matching passages.
          </p>
        </div>

        {/* ── Section 1: Main Document to Analyze (PRIMARY) ─────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-6 rounded-md bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <FileText className="size-3.5 text-indigo-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">
                Document to Analyze
              </h2>
            </div>
            <span className="text-xs text-zinc-400 font-mono">
              Step 1: Target Upload (1 Document)
            </span>
          </div>

          {!targetFile ? (
            <div
              {...getTargetProps()}
              id="target-dropzone"
              className={`surface-card rounded-2xl border-2 border-dashed p-10 sm:p-14 text-center cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isTargetDragActive 
                  ? 'border-indigo-500 bg-indigo-600/[0.08]' 
                  : 'border-white/[0.12] hover:border-indigo-400/50 hover:bg-white/[0.02]'
              }`}
            >
              <input {...getTargetInputProps()} id="target-file-input" />
              
              <div className="max-w-md mx-auto space-y-4">
                <div className="size-14 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-inner">
                  <Upload className={`size-7 ${isTargetDragActive ? 'text-indigo-300' : 'text-indigo-400'}`} />
                </div>

                <div className="space-y-1">
                  <p className="text-base font-semibold text-white">
                    {isTargetDragActive ? 'Drop your document here' : 'Drag & drop document to analyze'}
                  </p>
                  <p className="text-xs sm:text-sm text-zinc-400">
                    Supports native PDF, Microsoft Word DOCX, and Plain Text TXT files
                  </p>
                </div>

                {/* Badges for Supported Formats */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium text-rose-300 bg-rose-500/10 border border-rose-500/20">
                    PDF
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium text-blue-300 bg-blue-500/10 border border-blue-500/20">
                    DOCX
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium text-zinc-300 bg-zinc-500/10 border border-zinc-500/20">
                    TXT
                  </span>
                  <span className="text-xs text-zinc-400 font-mono ml-2">
                    Max 15 MB
                  </span>
                </div>

                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 transition-colors">
                    Browse Local File
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="surface-card rounded-2xl border border-indigo-500/30 bg-indigo-500/[0.04] p-5 sm:p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <FileTypeIcon name={targetFile.name} />
                  <div className="min-w-0">
                    <p className="text-sm sm:text-base font-semibold text-white truncate">
                      {targetFile.name}
                    </p>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                      {formatBytes(targetFile.size)} · Ready for comparison
                    </p>
                  </div>
                </div>

                <button
                  id="remove-target-file"
                  type="button"
                  onClick={() => {
                    setTargetFile(null);
                    setError(null);
                  }}
                  disabled={analyzing}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40"
                  aria-label="Remove selected document"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Upload Progress Bar */}
              <AnimatePresence>
                {analyzing && uploadProgress < 100 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-white/[0.06] space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                      <span>Uploading to NLP engine...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </motion.div>
                )}

                {analyzing && uploadProgress >= 100 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-2.5 text-xs sm:text-sm text-indigo-300 font-medium"
                  >
                    <Loader2 className="size-4 animate-spin text-indigo-400" />
                    <span>Computing transformer embeddings & TF-IDF similarity vectors...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Target File Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Alert variant="error" title="Analysis Error">
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Trigger Card */}
          <div className="surface-card rounded-2xl p-5 border border-white/[0.07] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-sm font-medium text-white flex items-center justify-center sm:justify-start gap-2">
                <ShieldCheck className="size-4 text-indigo-400" />
                Target Corpus Status:
              </p>
              <p className="text-xs text-zinc-400 font-mono">
                {refs.length === 0 
                  ? 'No reference documents indexed yet. Add reference files below.'
                  : `Comparing against ${refs.length} document${refs.length !== 1 ? 's' : ''} in your reference library.`
                }
              </p>
            </div>

            <Button
              id="run-analysis-btn"
              size="lg"
              onClick={handleRunAnalysis}
              loading={analyzing}
              disabled={!targetFile || refs.length === 0}
              icon={<CheckCircle2 className="size-4.5" />}
              className="w-full sm:w-auto min-w-[200px]"
            >
              {analyzing ? 'Analyzing Document…' : 'Run Analysis'}
            </Button>
          </div>
        </section>

        {/* ── Section 2: Reference Corpus Management (SECONDARY) ──────── */}
        <section className="space-y-5 pt-6 border-t border-white/[0.08]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="size-6 rounded-md bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                  <Database className="size-3.5 text-violet-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">
                  Reference Corpus
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
                  {refs.length} indexed
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Your reference baseline. Documents here are pre-indexed to compare against the document above.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="refresh-refs-btn"
                type="button"
                onClick={loadRefs}
                disabled={refsLoading}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-40"
                aria-label="Refresh reference list"
                title="Refresh corpus list"
              >
                <RefreshCw className={`size-4 ${refsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Reference Upload Dropzone */}
          <div
            {...getRefProps()}
            id="ref-dropzone"
            className={`surface-card rounded-xl border border-dashed p-6 text-center cursor-pointer transition-all duration-150 ${
              isRefDragActive 
                ? 'border-violet-500 bg-violet-600/[0.08]' 
                : 'border-white/[0.1] hover:border-violet-400/40 hover:bg-white/[0.02]'
            }`}
          >
            <input {...getRefInputProps()} id="ref-file-input" />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="size-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <Upload className="size-4 text-violet-400" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs sm:text-sm font-medium text-zinc-200">
                  {refUploading ? 'Indexing reference documents...' : 'Upload Reference Documents'}
                </p>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Drag & drop canonical files (PDF, DOCX, TXT up to 15 MB) to index into the corpus
                </p>
              </div>
            </div>
          </div>

          {/* Reference Error Notice */}
          <AnimatePresence>
            {refError && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Alert variant="error" title="Corpus Error">
                  {refError}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reference Documents Collection */}
          <div className="surface-card rounded-2xl border border-white/[0.08] overflow-hidden">
            <div className="px-5 py-3.5 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span>Indexed Corpus Documents</span>
              <span>Storage: Local Filesystem</span>
            </div>

            {refsLoading ? (
              <div className="p-6 space-y-3">
                <div className="shimmer h-12 rounded-xl" />
                <div className="shimmer h-12 rounded-xl" />
              </div>
            ) : refs.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <BookMarked className="size-10 text-zinc-700 mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-zinc-300">
                    No reference documents indexed
                  </p>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Upload papers, articles, or student submissions above so CopyCatch has reference material to detect similarities against.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {refs.map((ref) => (
                  <div
                    key={ref.filename}
                    className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <FileTypeIcon name={ref.filename} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-200 truncate">
                          {ref.filename}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono mt-0.5">
                          <span>{formatBytes(ref.size)}</span>
                          {ref.modified_at && (
                            <>
                              <span>•</span>
                              <span>Indexed {new Date(ref.modified_at).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id={`delete-ref-${ref.filename}`}
                        type="button"
                        onClick={() => handleDeleteRef(ref.filename)}
                        disabled={deletingRef === ref.filename}
                        className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-40"
                        aria-label={`Delete ${ref.filename}`}
                        title="Remove from reference corpus"
                      >
                        {deletingRef === ref.filename ? (
                          <Loader2 className="size-4 animate-spin text-rose-400" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
