import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, X, CheckCircle2, Loader2,
  FileText, BookMarked, Trash2,
  Database
} from 'lucide-react';
import {
  analyzeDocument, uploadReference, listReferences, deleteReference,
  type ReferenceDoc,
} from '../services/api';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { PageContainer } from '../components/layout/PageContainer';
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
      <div className="size-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center shrink-0">
        <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">PDF</span>
      </div>
    );
  }
  if (ext === 'docx') {
    return (
      <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center shrink-0">
        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">DOCX</span>
      </div>
    );
  }
  return (
    <div className="size-10 rounded-xl bg-highlight border border-border-medium flex items-center justify-center shrink-0">
      <span className="font-mono text-xs font-bold text-content-secondary">TXT</span>
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

  const loadRefs = useCallback(async () => {
    setRefsLoading(true);
    try {
      const data = await listReferences();
      setRefs(data);
    } catch {
      // Background issue
    } finally {
      setRefsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRefs();
  }, [loadRefs]);

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

  const { 
    getRootProps: getRefProps, 
    getInputProps: getRefInputProps, 
    isDragActive: isRefDragActive,
    open: openRefDialog
  } = useDropzone({
    accept: ACCEPTED_TYPES,
    maxFiles: 10,
    maxSize: 15 * 1024 * 1024,
    noClick: true,
    onDropAccepted: async (acceptedFiles) => {
      setRefUploading(true);
      setRefError(null);
      for (const file of acceptedFiles) {
        try {
          await uploadReference(file);
        } catch (e: any) {
          console.error("Upload error:", e);
          let errMsg = `Failed to upload reference: ${file.name}`;
          
          if (e.response) {
            const status = e.response.status;
            let detail = e.response.data?.detail;
            
            // FastAPI sometimes returns detail as an array of validation errors
            if (Array.isArray(detail)) {
              detail = detail.map((err: any) => err.msg || JSON.stringify(err)).join(", ");
            } else if (typeof detail === 'object') {
              detail = JSON.stringify(detail);
            }
            
            errMsg = `Reference upload failed (${status}): ${detail || e.message || 'Unknown backend error'}`;
          } else if (e.request) {
            errMsg = `Network error: Could not connect to backend. Is the server running?`;
          } else {
            errMsg = `Error: ${e.message}`;
          }
          
          setRefError(errMsg);
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
    if (!targetFile) {
      setError('Please select a target document first.');
      return;
    }
    if (refs.length === 0) {
      setError('No reference documents are currently indexed.');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setUploadProgress(0);

    try {
      const result = await analyzeDocument(targetFile, setUploadProgress);
      recordHistory(result);
      navigate(`/results/${result.analysis_id}`, { state: result });
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail ?? 'Analysis failed. Please try again. Verify backend connectivity.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <PageContainer withGrid className="pt-10 pb-24">
      <div className="space-y-10">
        
        {/* Page Heading */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-content tracking-tight">
            Analyze Document
          </h1>
          <p className="text-sm sm:text-base text-content-secondary max-w-2xl leading-relaxed">
            Upload one document to compare it against your indexed reference corpus.
          </p>
        </div>

        {/* 2-Column Desktop Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* ── LEFT: Target Document ─────────────── */}
          <section className="space-y-4">
            <h3 className="font-semibold text-content flex items-center gap-2">
              <FileText className="size-4 text-accent" /> Target Document
            </h3>

            {!targetFile ? (
              <div
                {...getTargetProps()}
                id="target-dropzone"
                className={`surface-card rounded-2xl border-2 border-dashed p-10 sm:p-14 text-center cursor-pointer transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent flex flex-col items-center justify-center min-h-[340px] ${
                  isTargetDragActive 
                    ? 'border-accent bg-accent/5 shadow-md' 
                    : 'border-border-strong hover:border-accent/50 hover:bg-highlight'
                }`}
              >
                <input {...getTargetInputProps()} id="target-file-input" />
                
                <div className="max-w-xs mx-auto space-y-6">
                  <div className="size-16 rounded-2xl bg-highlight border border-border-subtle flex items-center justify-center mx-auto shadow-inner">
                    <Upload className={`size-7 ${isTargetDragActive ? 'text-accent' : 'text-content-muted'}`} />
                  </div>

                  <div className="space-y-1">
                    <p className="text-base font-semibold text-content">
                      {isTargetDragActive ? 'Drop your document here' : 'Drag & drop document to analyze'}
                    </p>
                    <p className="text-xs sm:text-sm text-content-secondary">
                      Supports native PDF, Microsoft Word DOCX, and Plain Text TXT files
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <span className="px-2 py-1 rounded-md text-[10px] font-mono font-medium text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
                      PDF
                    </span>
                    <span className="px-2 py-1 rounded-md text-[10px] font-mono font-medium text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                      DOCX
                    </span>
                    <span className="px-2 py-1 rounded-md text-[10px] font-mono font-medium text-content-secondary bg-highlight border border-border-medium">
                      TXT
                    </span>
                    <span className="text-xs text-content-muted font-mono ml-2">
                      Max 15 MB
                    </span>
                  </div>

                  <div className="pt-4">
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-content hover:bg-content-secondary transition-colors shadow-sm cursor-pointer">
                      Browse Local File
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="surface-card rounded-2xl border border-accent/30 bg-accent/5 p-5 sm:p-8 shadow-sm flex flex-col justify-center min-h-[340px]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <FileTypeIcon name={targetFile.name} />
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-semibold text-content truncate">
                        {targetFile.name}
                      </p>
                      <p className="text-xs text-content-muted font-mono mt-0.5">
                        {formatBytes(targetFile.size)} &middot; Selected Target
                      </p>
                    </div>
                  </div>

                  <button
                    id="remove-target-file"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTargetFile(null);
                      setError(null);
                    }}
                    disabled={analyzing}
                    className="p-2 rounded-xl text-content-muted hover:text-content hover:bg-highlight transition-colors disabled:opacity-40 shrink-0"
                    aria-label="Remove selected document"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <AnimatePresence>
                  {analyzing && uploadProgress < 100 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-border-subtle space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs text-content-muted font-mono">
                        <span>Uploading to NLP engine...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-highlight overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent transition-all duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {analyzing && uploadProgress >= 100 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-6 pt-6 border-t border-border-subtle flex items-center gap-3 text-xs sm:text-sm text-accent font-medium"
                    >
                      <Loader2 className="size-5 animate-spin text-accent shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-bold">ANALYZING DOCUMENT</span>
                        <span className="text-content-secondary mt-0.5 text-xs font-normal">Extracting text, computing semantic similarities, & checking lexical overlap...</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Alert variant="error" title="Analysis Notice">
                    {error}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </section>


          {/* ── RIGHT: Reference Corpus ─────────────── */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-content flex items-center gap-2">
                <Database className="size-4 text-purple-500" /> Reference Corpus
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-highlight text-content-secondary border border-border-subtle">
                {refs.length} Indexed
              </span>
            </div>

            <div 
              {...getRefProps()}
              className={`surface-card rounded-2xl border ${isRefDragActive ? 'border-accent bg-accent/5' : 'border-border-subtle'} overflow-hidden shadow-sm flex flex-col min-h-[340px] relative`}
            >
              <input {...getRefInputProps()} />
              
              {/* Reference Dropzone Header */}
              <div
                onClick={openRefDialog}
                className="border-b border-border-subtle p-5 text-center cursor-pointer transition-colors bg-surface hover:bg-highlight"
              >
                <p className="text-sm font-semibold text-content flex items-center justify-center gap-2">
                  <Upload className="size-4 text-content-muted" />
                  {refUploading ? 'Indexing references...' : 'Click or drop files to upload references'}
                </p>
                <p className="text-xs text-content-muted mt-1">PDF, DOCX, TXT max 15MB</p>
              </div>

              {/* Reference List */}
              <div className="flex-1 overflow-y-auto p-0 bg-base max-h-[250px] lg:max-h-[300px]">
                {refsLoading ? (
                  <div className="p-4 space-y-3">
                    <div className="shimmer h-12 rounded-lg" />
                    <div className="shimmer h-12 rounded-lg" />
                  </div>
                ) : refs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center text-content-muted min-h-[200px]">
                    <BookMarked className="size-10 mb-3 opacity-40 text-content-muted" />
                    <p className="text-sm font-semibold text-content-secondary mb-1">No reference documents indexed yet.</p>
                    <p className="text-xs max-w-[220px]">Upload papers, articles, or previous submissions to build the comparison corpus.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border-subtle">
                    {refs.map((ref) => (
                      <div key={ref.filename} className="p-4 flex items-center justify-between gap-3 hover:bg-highlight transition-colors group">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileTypeIcon name={ref.filename} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-content truncate">
                              {ref.filename}
                            </p>
                            <p className="text-[11px] text-content-muted font-mono mt-0.5">
                              {formatBytes(ref.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRef(ref.filename);
                          }}
                          disabled={deletingRef === ref.filename}
                          className="p-2 rounded-lg text-content-muted hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-40 sm:opacity-50 sm:group-hover:opacity-100 shrink-0"
                          title={`Delete ${ref.filename}`}
                        >
                          {deletingRef === ref.filename ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {refError && (
              <div className="pt-2">
                <Alert variant="error" title="Corpus Error">{refError}</Alert>
              </div>
            )}
          </section>

        </div>

        {/* ── Run Analysis Action ──────── */}
        <div className="flex justify-center pt-8 border-t border-border-subtle">
          <div className="flex flex-col items-center space-y-4">
            <Button
              id="run-analysis-btn"
              size="lg"
              onClick={handleRunAnalysis}
              loading={analyzing}
              disabled={!targetFile || refs.length === 0 || analyzing}
              icon={<CheckCircle2 className="size-5" />}
              className={`min-w-[300px] text-base font-bold shadow-lg ${!targetFile || refs.length === 0 ? '' : 'bg-accent hover:bg-accent-hover text-white border-transparent'}`}
            >
              {analyzing ? 'ANALYZING...' : 'RUN ANALYSIS'}
            </Button>
            
            <div className="h-6 flex items-center justify-center">
              {refs.length === 0 && targetFile && !analyzing && (
                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                  Cannot analyze without a reference corpus. Add files to the corpus first.
                </p>
              )}
            </div>
          </div>
        </div>

      </div>
    </PageContainer>
  );
}
