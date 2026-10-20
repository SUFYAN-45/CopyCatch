import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, X, CheckCircle2, Loader2,
  FileText, BookMarked, Trash2,
  Database, RefreshCw, AlertCircle,
  Search, Sparkles, Sliders
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
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

function FileTypeBadge({ name }: { name: string }) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') {
    return (
      <div className="size-9 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center shrink-0">
        <span className="font-mono text-[11px] font-bold text-rose-600 dark:text-rose-400">PDF</span>
      </div>
    );
  }
  if (ext === 'docx') {
    return (
      <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center shrink-0">
        <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">DOCX</span>
      </div>
    );
  }
  return (
    <div className="size-9 rounded-xl bg-highlight border border-border-medium flex items-center justify-center shrink-0">
      <span className="font-mono text-[11px] font-bold text-content-secondary">TXT</span>
    </div>
  );
}

export default function AnalyzePage() {
  const navigate = useNavigate();

  // Target file state
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Reference corpus state
  const [refs, setRefs] = useState<ReferenceDoc[]>([]);
  const [refsLoading, setRefsLoading] = useState(true);
  const [refUploading, setRefUploading] = useState(false);
  const [refError, setRefError] = useState<string | null>(null);
  const [refSuccess, setRefSuccess] = useState<string | null>(null);
  const [deletingRef, setDeletingRef] = useState<string | null>(null);
  const [refSearchQuery, setRefSearchQuery] = useState('');
  const [excludeQuotes, setExcludeQuotes] = useState(false);
  const [excludeBibliography, setExcludeBibliography] = useState(false);

  const loadRefs = useCallback(async () => {
    setRefsLoading(true);
    setRefError(null);
    try {
      const data = await listReferences();
      setRefs(data);
    } catch {
      setRefError('Failed to load reference corpus from backend.');
    } finally {
      setRefsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRefs();
  }, [loadRefs]);

  // Target document dropzone
  const { 
    getRootProps: getTargetProps, 
    getInputProps: getTargetInputProps, 
    isDragActive: isTargetDragActive,
    open: openTargetDialog
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

  // Reference corpus dropzone
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
      setRefSuccess(null);
      let successCount = 0;
      
      for (const file of acceptedFiles) {
        try {
          await uploadReference(file);
          successCount++;
        } catch (e: unknown) {
          const axiosErr = e as { response?: { status?: number; data?: { detail?: string | unknown } }; message?: string };
          let errMsg = `Failed to upload reference: ${file.name}`;
          
          if (axiosErr.response) {
            const status = axiosErr.response.status;
            let detail = axiosErr.response.data?.detail;
            if (Array.isArray(detail)) {
              detail = detail.map((err: { msg?: string }) => err.msg || JSON.stringify(err)).join(', ');
            } else if (typeof detail === 'object') {
              detail = JSON.stringify(detail);
            }
            errMsg = `Reference upload failed (${status}): ${detail || axiosErr.message || 'Unknown error'}`;
          } else {
            errMsg = `Network error: Could not reach backend server.`;
          }
          setRefError(errMsg);
        }
      }

      await loadRefs();
      setRefUploading(false);

      if (successCount > 0) {
        setRefSuccess(`Successfully added ${successCount} document${successCount !== 1 ? 's' : ''} to reference corpus.`);
        setTimeout(() => setRefSuccess(null), 4000);
      }
    },
    onDropRejected: (rejections) => {
      setRefError(rejections[0]?.errors[0]?.message ?? 'One or more reference files were rejected.');
    },
  });

  const handleDeleteRef = async (filename: string) => {
    setDeletingRef(filename);
    setRefError(null);
    try {
      await deleteReference(filename);
      setRefs((prev) => prev.filter((r) => r.filename !== filename));
    } catch {
      setRefError(`Failed to delete reference "${filename}".`);
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
      setError('No reference documents are currently indexed. Add reference files first.');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setUploadProgress(0);

    try {
      const result = await analyzeDocument(targetFile, setUploadProgress, {
        exclude_quotes: excludeQuotes,
        exclude_bibliography: excludeBibliography,
      });
      recordHistory(result);
      navigate(`/results/${result.analysis_id}`, { state: result });
    } catch (e: unknown) {
      const axiosErr = e as { response?: { data?: { detail?: string } } };
      const detail = axiosErr?.response?.data?.detail;
      setError(detail ?? 'Analysis failed. Please check backend service connectivity.');
    } finally {
      setAnalyzing(false);
    }
  };

  const isAnalyzeDisabled = !targetFile || refs.length === 0 || analyzing;

  return (
    <PageContainer withGrid>
      <div style={{ paddingTop: '32px', paddingBottom: '80px' }}>
        
        {/* Page Heading Area - margin-bottom: 40px */}
        <div style={{ marginBottom: '40px' }} className="space-y-2 border-b border-border-subtle pb-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20">
              Analysis Console
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-content tracking-tight">
            Analyze Document
          </h1>
          <p className="text-sm sm:text-base text-content-secondary max-w-2xl leading-relaxed">
            Upload your target document and compare it against your indexed reference corpus to compute semantic and lexical similarity.
          </p>
        </div>

        {/* Global Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginBottom: '24px' }}>
              <Alert variant="error" title="Analysis Notice">
                {error}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2-Column Desktop Grid */}
        <div 
          className="grid grid-cols-1 lg:grid-cols-2"
          style={{ gap: '32px', alignItems: 'stretch' }}
        >
          
          {/* ── LEFT: Target Document Card ───────────────────────────────── */}
          <section className="flex flex-col">
            <div 
              className="surface-card flex flex-col justify-between h-full"
              style={{ padding: '32px', borderRadius: '16px' }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                  <h2 className="text-base font-bold text-content flex items-center gap-2.5">
                    <FileText className="size-4.5 text-accent" />
                    <span>Target Document</span>
                  </h2>
                  <span className="text-xs font-mono text-content-muted">
                    {targetFile ? '1 File Selected' : 'Pending Selection'}
                  </span>
                </div>

                {!targetFile ? (
                  <div
                    {...getTargetProps()}
                    id="target-dropzone"
                    className={`rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                      isTargetDragActive 
                        ? 'border-accent bg-accent/5' 
                        : 'border-border-strong hover:border-accent hover:bg-highlight'
                    }`}
                    style={{ padding: '40px 24px', minHeight: '220px' }}
                  >
                    <input {...getTargetInputProps()} id="target-file-input" />
                    
                    <div className="max-w-sm mx-auto space-y-4 flex flex-col items-center">
                      <div className="size-14 rounded-2xl bg-highlight border border-border-subtle flex items-center justify-center shadow-inner">
                        <Upload className={`size-6 ${isTargetDragActive ? 'text-accent' : 'text-content-muted'}`} />
                      </div>

                      <div className="space-y-1">
                        <p className="text-base font-bold text-content">
                          {isTargetDragActive ? 'Drop target document here' : 'Drag & drop document to analyze'}
                        </p>
                        <p className="text-xs text-content-secondary">
                          Select the paper or assignment to evaluate against your corpus.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
                          PDF
                        </span>
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                          DOCX
                        </span>
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold text-content-secondary bg-highlight border border-border-medium">
                          TXT
                        </span>
                        <span className="text-xs text-content-muted font-mono ml-2">
                          Max 15 MB
                        </span>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openTargetDialog();
                          }}
                          className="btn-primary"
                          style={{ padding: '8px 18px', fontSize: '0.8125rem' }}
                        >
                          Browse Local File
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-accent/40 bg-accent/5 p-5 space-y-5"
                  >
                    <div className="flex items-center justify-between gap-4 pb-3 border-b border-border-subtle">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <FileTypeBadge name={targetFile.name} />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-content truncate font-mono">
                            {targetFile.name}
                          </p>
                          <p className="text-xs text-content-muted font-mono mt-0.5">
                            {formatBytes(targetFile.size)} &middot; Ready for Analysis
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
                        className="p-2 rounded-xl text-content-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remove target file"
                      >
                        <X className="size-5" />
                      </button>
                    </div>

                    <div className="space-y-2 bg-surface p-3.5 rounded-xl border border-border-subtle text-xs">
                      <div className="flex justify-between text-content-secondary">
                        <span>Format:</span>
                        <span className="font-mono font-medium text-content uppercase">{targetFile.name.split('.').pop()}</span>
                      </div>
                      <div className="flex justify-between text-content-secondary">
                        <span>Size:</span>
                        <span className="font-mono font-medium text-content">{formatBytes(targetFile.size)}</span>
                      </div>
                      <div className="flex justify-between text-content-secondary">
                        <span>Status:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="size-3.5" /> Stage Ready
                        </span>
                      </div>
                    </div>

                    <AnimatePresence>
                      {analyzing && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 pt-2">
                          <div className="flex items-center justify-between text-xs text-content-secondary font-mono">
                            <span>{uploadProgress < 100 ? 'Uploading document...' : 'Computing vector similarities...'}</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-highlight overflow-hidden">
                            <div
                              className="h-full rounded-full bg-accent transition-all duration-200"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            </div>
          </section>

          {/* ── RIGHT: Reference Corpus Card ────────────────────────────── */}
          <section className="flex flex-col">
            <div 
              className="surface-card flex flex-col justify-between h-full"
              style={{ padding: '32px', borderRadius: '16px' }}
            >
              <div className="space-y-4 flex flex-col flex-1">
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-content flex items-center gap-2">
                      <Database className="size-4.5 text-purple-500" />
                      <span>Reference Corpus</span>
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-highlight text-content-secondary border border-border-subtle">
                      {refs.length} Indexed
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-accent/10 text-accent border border-accent/20 hidden sm:inline-block">
                      {formatBytes(refs.reduce((acc, r) => acc + (r.size || 0), 0))} Total
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={loadRefs}
                    disabled={refsLoading}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-content-secondary hover:text-content bg-surface hover:bg-highlight border border-border-subtle rounded-lg transition-colors cursor-pointer"
                    style={{ padding: '6px 12px' }}
                    title="Refresh reference list"
                  >
                    <RefreshCw className={`size-3.5 ${refsLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Dropzone area */}
                <div 
                  {...getRefProps()}
                  className={`rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                    isRefDragActive ? 'border-accent bg-accent/5' : 'border-border-strong hover:border-accent hover:bg-highlight'
                  }`}
                  style={{ padding: '24px 16px' }}
                >
                  <input {...getRefInputProps()} />
                  <div onClick={openRefDialog} className="flex flex-col items-center justify-center space-y-1">
                    <p className="text-sm font-semibold text-content flex items-center gap-2">
                      {refUploading ? (
                        <>
                          <Loader2 className="size-4 animate-spin text-accent" />
                          <span>Indexing references...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="size-4 text-content-muted" />
                          <span>Click to browse or drop reference files</span>
                        </>
                      )}
                    </p>
                    <p className="text-xs text-content-muted">
                      PDF, DOCX, TXT up to 10 files (max 15 MB each)
                    </p>
                  </div>
                </div>

                {/* Feedback banners */}
                <AnimatePresence>
                  {refSuccess && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-xs font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                      <span>{refSuccess}</span>
                    </motion.div>
                  )}
                  {refError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-2">
                      <AlertCircle className="size-4 shrink-0 text-rose-500" />
                      <span>{refError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Search input if refs.length > 3 */}
                {refs.length > 3 && (
                  <div className="relative">
                    <Search className="size-3.5 text-content-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={refSearchQuery}
                      onChange={(e) => setRefSearchQuery(e.target.value)}
                      placeholder="Filter indexed reference files..."
                      className="w-full pl-8 pr-7 py-1.5 rounded-lg text-xs bg-surface border border-border-medium text-content placeholder:text-content-muted focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    {refSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setRefSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-content-muted hover:text-content p-0.5 cursor-pointer"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </div>
                )}

                {/* Reference list with word-break: break-word & padding: 12px 16px */}
                <div 
                  className="overflow-y-auto rounded-xl border border-border-subtle bg-base divide-y divide-border-subtle"
                  style={{ maxHeight: '240px' }}
                >
                  {refsLoading ? (
                    <div style={{ padding: '16px' }} className="space-y-3">
                      <div className="shimmer h-10 rounded-lg" />
                      <div className="shimmer h-10 rounded-lg" />
                    </div>
                  ) : refs.length === 0 ? (
                    <div style={{ padding: '28px 16px', textAlign: 'center' }} className="text-content-muted">
                      <BookMarked className="size-8 mx-auto mb-2 opacity-30 text-content-muted" />
                      <p className="text-xs font-semibold text-content-secondary">No reference documents indexed</p>
                      <p className="text-[11px] max-w-xs mx-auto mt-1">Upload reference materials to build your comparative corpus.</p>
                    </div>
                  ) : (
                    (() => {
                      const displayed = refSearchQuery.trim()
                        ? refs.filter((r) => r.filename.toLowerCase().includes(refSearchQuery.toLowerCase().trim()))
                        : refs;

                      if (displayed.length === 0) {
                        return (
                          <div style={{ padding: '20px 16px', textAlign: 'center' }} className="text-content-muted text-xs">
                            No references match "{refSearchQuery}"
                          </div>
                        );
                      }

                      return displayed.map((ref) => (
                        <div 
                          key={ref.filename} 
                          className="flex items-center justify-between gap-3 hover:bg-highlight transition-colors"
                          style={{ padding: '12px 16px' }}
                        >
                          <div className="flex items-center gap-3 min-w-0" style={{ wordBreak: 'break-word' }}>
                            <FileTypeBadge name={ref.filename} />
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-content font-mono" style={{ wordBreak: 'break-all' }}>
                                {ref.filename}
                              </p>
                              <p className="text-[11px] text-content-muted font-mono mt-0.5">
                                {formatBytes(ref.size)} &middot; Indexed
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteRef(ref.filename)}
                            disabled={deletingRef === ref.filename}
                            className="p-1.5 rounded-lg text-content-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                            title={`Delete ${ref.filename}`}
                          >
                            {deletingRef === ref.filename ? (
                              <Loader2 className="size-4 animate-spin text-rose-500" />
                            ) : (
                              <Trash2 className="size-4" />
                            )}
                          </button>
                        </div>
                      ));
                    })()
                  )}
                </div>

                {/* Corpus footer metrics */}
                {refs.length > 0 && (
                  <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-content-muted font-mono">
                    <span>Corpus Volume: <strong className="text-content">{formatBytes(refs.reduce((acc, r) => acc + (r.size || 0), 0))}</strong></span>
                    <span>{refs.length} file{refs.length !== 1 ? 's' : ''} staged</span>
                  </div>
                )}
              </div>
            </div>
          </section>

        </div>

        {/* ── RUN ANALYSIS AREA: margin-top: 32px; padding: 24px ───────── */}
        <div 
          className="surface-card rounded-2xl border border-border-subtle flex flex-col items-center justify-center text-center space-y-4"
          style={{ marginTop: '32px', padding: '28px 24px' }}
        >
          {/* Smart Preprocessing Filters */}
          <div className="flex items-center justify-center gap-3 flex-wrap pb-1">
            <span className="text-xs font-mono text-content-muted flex items-center gap-1.5 mr-1">
              <Sliders className="size-3.5 text-accent" />
              <span>Smart Filters:</span>
            </span>

            <button
              type="button"
              onClick={() => setExcludeQuotes((prev) => !prev)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                excludeQuotes
                  ? 'bg-accent/10 text-accent border-accent/40 shadow-xs ring-1 ring-accent/30'
                  : 'bg-surface text-content-secondary border-border-medium hover:border-accent hover:text-content'
              }`}
            >
              <span className={`size-3.5 rounded border flex items-center justify-center transition-colors ${
                excludeQuotes ? 'bg-accent border-accent text-white' : 'border-border-strong bg-highlight'
              }`}>
                {excludeQuotes && <CheckCircle2 className="size-3" />}
              </span>
              <span>Ignore Quoted Citations ("...")</span>
            </button>

            <button
              type="button"
              onClick={() => setExcludeBibliography((prev) => !prev)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                excludeBibliography
                  ? 'bg-accent/10 text-accent border-accent/40 shadow-xs ring-1 ring-accent/30'
                  : 'bg-surface text-content-secondary border-border-medium hover:border-accent hover:text-content'
              }`}
            >
              <span className={`size-3.5 rounded border flex items-center justify-center transition-colors ${
                excludeBibliography ? 'bg-accent border-accent text-white' : 'border-border-strong bg-highlight'
              }`}>
                {excludeBibliography && <CheckCircle2 className="size-3" />}
              </span>
              <span>Exclude Bibliography / References</span>
            </button>
          </div>

          {/* 3-Step Readiness Stepper */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            {/* Step 1: Corpus Indexed */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              refs.length > 0 
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25'
                : 'bg-highlight text-content-muted border-border-subtle'
            }`}>
              {refs.length > 0 ? (
                <CheckCircle2 className="size-3.5 text-emerald-500" />
              ) : (
                <span className="size-1.5 rounded-full bg-content-muted" />
              )}
              <span>Step 1: Corpus Indexed ({refs.length})</span>
            </div>

            <span className="text-content-muted text-xs hidden sm:inline">&rarr;</span>

            {/* Step 2: Target Staged */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              targetFile !== null 
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25'
                : 'bg-highlight text-content-muted border-border-subtle'
            }`}>
              {targetFile !== null ? (
                <CheckCircle2 className="size-3.5 text-emerald-500" />
              ) : (
                <span className="size-1.5 rounded-full bg-content-muted" />
              )}
              <span>Step 2: Target Staged</span>
            </div>

            <span className="text-content-muted text-xs hidden sm:inline">&rarr;</span>

            {/* Step 3: Dual-Channel Engine Ready */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              targetFile !== null && refs.length > 0
                ? 'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30 shadow-sm'
                : 'bg-highlight text-content-muted border-border-subtle'
            }`}>
              <Sparkles className="size-3.5 text-purple-500" />
              <span>Step 3: Dual-Channel Engine Ready</span>
            </div>
          </div>

          <Button
            id="run-analysis-btn"
            size="lg"
            onClick={handleRunAnalysis}
            loading={analyzing}
            disabled={isAnalyzeDisabled}
            icon={<CheckCircle2 className="size-5" />}
            style={{ minWidth: '320px', padding: '14px 32px' }}
          >
            {analyzing ? 'RUNNING FORENSIC ANALYSIS...' : 'RUN FORENSIC ANALYSIS'}
          </Button>

          <div className="text-xs font-medium">
            {!targetFile && (
              <span className="text-content-muted">
                Step 1: Upload a target document (.pdf, .docx, or .txt) above.
              </span>
            )}
            {targetFile && refs.length === 0 && !analyzing && (
              <span className="text-amber-600 dark:text-amber-400">
                Step 2: Add at least one reference document to the corpus to compare against.
              </span>
            )}
            {targetFile && refs.length > 0 && !analyzing && (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="size-3.5" /> Ready: Document and {refs.length} reference{refs.length !== 1 ? 's' : ''} staged for dual-channel comparison.
              </span>
            )}
          </div>
        </div>

      </div>
    </PageContainer>
  );
}