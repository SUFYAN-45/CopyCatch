import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, X, CheckCircle2, Loader2,
  FileText, BookMarked, RefreshCw, Trash2, Info,
} from 'lucide-react';
import {
  analyzeDocument, uploadReference, listReferences, deleteReference,
  type ReferenceDoc,
} from '../services/api';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { recordHistory } from './HistoryPage';

const ACCEPTED = { 'text/plain': ['.txt'], 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] };
const FMT_BYTES = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

function FileIcon({ name }: { name: string }) {
  const ext = name.split('.').pop()?.toLowerCase();
  const colors: Record<string, string> = { pdf: 'text-red-400', docx: 'text-blue-400', txt: 'text-zinc-300' };
  return <FileText className={`size-5 ${colors[ext ?? ''] ?? 'text-zinc-400'}`} />;
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

  // Load references
  const loadRefs = useCallback(async () => {
    setRefsLoading(true);
    try {
      const data = await listReferences();
      setRefs(data);
    } catch { /* backend might be offline */ }
    finally { setRefsLoading(false); }
  }, []);

  useEffect(() => { loadRefs(); }, [loadRefs]);

  // Target file drop
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED,
    maxFiles: 1,
    maxSize: 15 * 1024 * 1024,
    onDropAccepted: ([f]) => { setTargetFile(f); setError(null); },
    onDropRejected: ([r]) => setError(r.errors[0]?.message ?? 'File rejected.'),
  });

  // Reference file drop
  const { getRootProps: getRefRootProps, getInputProps: getRefInputProps, isDragActive: isRefDrag } = useDropzone({
    accept: ACCEPTED,
    maxFiles: 5,
    maxSize: 15 * 1024 * 1024,
    onDropAccepted: async (files) => {
      setRefUploading(true);
      setRefError(null);
      for (const f of files) {
        try {
          await uploadReference(f);
        } catch (e: unknown) {
          const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Upload failed.';
          setRefError(msg);
        }
      }
      await loadRefs();
      setRefUploading(false);
    },
    onDropRejected: ([r]) => setRefError(r.errors[0]?.message ?? 'File rejected.'),
  });

  const handleDelete = async (filename: string) => {
    setDeletingRef(filename);
    try {
      await deleteReference(filename);
      setRefs((prev) => prev.filter((r) => r.filename !== filename));
    } catch { setRefError('Could not delete reference.'); }
    finally { setDeletingRef(null); }
  };

  const handleAnalyze = async () => {
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
      setError(detail ?? 'Analysis failed. Make sure the backend is running.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-grid pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Plagiarism Analyzer</h1>
          <p className="text-zinc-400">Upload reference documents, then submit the document you want to check.</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">

          {/* ── Left: Target Document ─── */}
          <div className="lg:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-base font-semibold text-zinc-200 mb-3 flex items-center gap-2">
                <FileText className="size-4 text-indigo-400" />
                Document to Analyze
              </h2>

              {/* Drop zone */}
              {!targetFile ? (
                <div
                  {...getRootProps()}
                  id="target-dropzone"
                  className={`rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 p-12 text-center
                    ${isDragActive ? 'border-indigo-500 bg-indigo-500/8' : 'border-white/12 hover:border-indigo-500/50 hover:bg-white/3'}`}
                >
                  <input {...getInputProps()} />
                  <Upload className={`size-8 mx-auto mb-4 ${isDragActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                  <p className="font-medium text-zinc-300 mb-1">
                    {isDragActive ? 'Drop to analyze' : 'Drop document here'}
                  </p>
                  <p className="text-sm text-zinc-500">TXT, PDF, DOCX · Max 15 MB</p>
                  <div className="mt-6">
                    <span className="text-xs font-medium text-indigo-400 border border-indigo-500/30 rounded-lg px-4 py-2 bg-indigo-500/10">
                      Browse files
                    </span>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-indigo-500/30 bg-indigo-500/6 p-5 flex items-center gap-4"
                >
                  <div className="size-12 rounded-xl bg-indigo-600/15 flex items-center justify-center shrink-0">
                    <FileIcon name={targetFile.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-200 truncate">{targetFile.name}</p>
                    <p className="text-sm text-zinc-500">{FMT_BYTES(targetFile.size)}</p>
                  </div>
                  <button
                    id="remove-target-file"
                    onClick={() => { setTargetFile(null); setError(null); }}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                    aria-label="Remove file"
                  >
                    <X className="size-5" />
                  </button>
                </motion.div>
              )}

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Alert variant="error" className="mt-4">{error}</Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Upload progress */}
              <AnimatePresence>
                {analyzing && uploadProgress < 100 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-4"
                  >
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
                      <span>Uploading…</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-indigo-500"
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                )}
                {analyzing && uploadProgress >= 100 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 flex items-center gap-2 text-sm text-indigo-300"
                  >
                    <Loader2 className="size-4 animate-spin" />
                    Running similarity analysis…
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Analyze button */}
              <Button
                id="run-analysis-btn"
                className="mt-6 w-full"
                size="lg"
                onClick={handleAnalyze}
                loading={analyzing}
                disabled={!targetFile || refs.length === 0}
                icon={<CheckCircle2 className="size-4" />}
              >
                {analyzing ? 'Analyzing…' : 'Run Analysis'}
              </Button>

              {refs.length === 0 && !analyzing && (
                <p className="mt-2 text-xs text-zinc-500 flex items-center gap-1.5 justify-center">
                  <Info className="size-3.5" />
                  Add at least one reference document before analyzing.
                </p>
              )}
            </motion.div>
          </div>

          {/* ── Right: Reference Corpus ─── */}
          <div className="lg:col-span-2 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-zinc-200 flex items-center gap-2">
                  <BookMarked className="size-4 text-violet-400" />
                  Reference Corpus
                  <span className="text-xs font-normal text-zinc-500 ml-1">({refs.length} docs)</span>
                </h2>
                <button
                  id="refresh-refs-btn"
                  onClick={loadRefs}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label="Refresh references"
                >
                  <RefreshCw className={`size-4 ${refsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Ref drop zone */}
              <div
                {...getRefRootProps()}
                id="ref-dropzone"
                className={`rounded-xl border border-dashed cursor-pointer transition-all duration-200 p-5 text-center text-sm
                  ${isRefDrag ? 'border-violet-500 bg-violet-500/8' : 'border-white/10 hover:border-violet-500/40 hover:bg-white/3'}`}
              >
                <input {...getRefInputProps()} />
                {refUploading ? (
                  <div className="flex items-center justify-center gap-2 text-violet-400">
                    <Loader2 className="size-4 animate-spin" /> Uploading…
                  </div>
                ) : (
                  <>
                    <Upload className={`size-5 mx-auto mb-2 ${isRefDrag ? 'text-violet-400' : 'text-zinc-600'}`} />
                    <p className="text-zinc-400">Drop reference files here</p>
                    <p className="text-xs text-zinc-600 mt-1">Up to 5 at once · TXT, PDF, DOCX</p>
                  </>
                )}
              </div>

              <AnimatePresence>
                {refError && (
                  <Alert variant="error" className="mt-2 text-xs">{refError}</Alert>
                )}
              </AnimatePresence>

              {/* Ref list */}
              <div className="space-y-2 mt-3 max-h-80 overflow-y-auto pr-1">
                {refsLoading && (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="shimmer h-14 rounded-xl" />
                    ))}
                  </div>
                )}
                {!refsLoading && refs.length === 0 && (
                  <div className="text-center py-8 text-zinc-600 text-sm">
                    <BookMarked className="size-8 mx-auto mb-2 opacity-40" />
                    No reference documents yet
                  </div>
                )}
                <AnimatePresence>
                  {refs.map((ref) => (
                    <motion.div
                      key={ref.filename}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center gap-3 rounded-xl border border-white/7 bg-zinc-900/50 px-4 py-3"
                    >
                      <FileIcon name={ref.filename} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-300 truncate">{ref.filename}</p>
                        <p className="text-xs text-zinc-600">{FMT_BYTES(ref.size)}</p>
                      </div>
                      <button
                        id={`delete-ref-${ref.filename}`}
                        onClick={() => handleDelete(ref.filename)}
                        disabled={deletingRef === ref.filename}
                        className="text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-40"
                        aria-label={`Delete ${ref.filename}`}
                      >
                        {deletingRef === ref.filename
                          ? <Loader2 className="size-4 animate-spin" />
                          : <Trash2 className="size-4" />}
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
