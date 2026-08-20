"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadDropzone } from "@/components/upload-dropzone";
import { DashboardStory } from "@/components/dashboard-story";
import { Database, Sparkles, Download, Save, Clock, CheckCircle2, AlertTriangle, Trash2, X } from "lucide-react";
import { toPng } from 'html-to-image';
import jsPDF from "jspdf";
import { SavedReport, getReports, saveReport, loadReportById, deleteReport } from "@/lib/storage";
import { profileDataset } from "@/lib/profiler";
import { StoryData } from "@/lib/schema";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [story, setStory] = useState<StoryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [datasetInfo, setDatasetInfo] = useState<{fileName: string, totalRows: number} | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [hasSavedReport, setHasSavedReport] = useState(false);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFileName, setExportFileName] = useState("datells-report");
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: "" });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const reports = getReports();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSavedReports(reports);
      if (reports.length > 0) setHasSavedReport(true);
    }
  }, []);

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  const saveToLocal = () => {
    if (story) {
      const newReport: SavedReport = {
        id: crypto.randomUUID(),
        title: story.title,
        fileName: datasetInfo?.fileName || 'Unknown Dataset',
        createdAt: new Date().toISOString(),
        rowCount: datasetInfo?.totalRows || 0,
        insightsSummary: story.executiveSummary,
        dashboardState: story,
      };
      saveReport(newReport);
      setSavedReports(getReports());
      setHasSavedReport(true);
      showToast("Report saved successfully!");
    }
  };

  const loadFromHistory = (id: string) => {
    const report = loadReportById(id);
    if (report) {
      setStory(report.dashboardState);
      setDatasetInfo({ fileName: report.fileName, totalRows: report.rowCount });
      setShowHistoryModal(false);
      showToast("Report loaded");
    }
  };

  const handleDeleteReport = (id: string) => {
    deleteReport(id);
    const updated = getReports();
    setSavedReports(updated);
    if (updated.length === 0) setHasSavedReport(false);
    showToast("Report deleted");
  };

  const exportToPDF = async (fileName: string) => {
    if (!reportRef.current) return;
    setIsExporting(true);
    setShowExportModal(false);
    
    try {
      const node = reportRef.current;
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        backgroundColor: '#020617', // match slate-950
      });
      
      const width = node.offsetWidth * 2;
      const height = node.offsetHeight * 2;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [width, height]
      });
      
      pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
      pdf.save(`${fileName || "datells-report"}.pdf`);
      showToast("PDF Exported successfully!");
    } catch (err: unknown) {
      console.error(err);
      setError("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setStory(null);

    try {
      // 1. Profile dataset locally with DuckDB
      console.log("Profiling dataset...");
      const datasetSummary = await profileDataset(file);
      setDatasetInfo({ fileName: file.name, totalRows: datasetSummary.totalRows });
      console.log("Dataset summary:", datasetSummary);

      // 2. Generate story via API
      console.log("Generating story via LLM...");
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ datasetSummary }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate story');
      }

      const { story } = await response.json();
      setStory(story);

    } catch (err: unknown) {
      console.error(err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 selection:bg-purple-500/30 overflow-x-hidden relative">
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Ambient Glow */}
        <div 
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 40%, rgba(147, 51, 234, 0.18) 0%, rgba(99, 102, 241, 0.08) 40%, transparent 70%)"
          }}
        />

        {/* Sonar Rings */}
        <AnimatedSonar />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16 flex flex-col items-center">
        {!story ? (
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center mt-12 md:mt-24">
            <Sparkles 
              className="w-12 h-12 text-purple-400 mb-6 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]"
              strokeWidth={1.5}
            />
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-sans font-bold tracking-tight text-center mb-6 text-white">
              Datells
            </h1>
            <p className="font-sans text-base md:text-lg text-slate-300 text-center max-w-2xl mb-12 leading-relaxed">
              Drop any CSV, Excel (.xlsx), or JSON file to instantly generate an AI-powered interactive data story dashboard. Processed securely in your browser.
            </p>

            <UploadDropzone onFileUpload={handleFileUpload} isLoading={isLoading} />
            
            {hasSavedReport && !isLoading && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setShowHistoryModal(true)}
                className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800 text-slate-300 rounded-xl transition-all shadow-lg group"
              >
                <Clock className="w-4 h-4 text-purple-400 group-hover:-rotate-180 transition-transform duration-500" />
                <span className="text-sm font-medium">View History</span>
              </motion.button>
            )}

            {error && (
              <div className="mt-8 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl max-w-2xl w-full text-center">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-7xl mx-auto mb-8 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <Database className="w-6 h-6 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-200">Datells</h2>
              </div>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3">
                <button 
                  onClick={() => setShowHistoryModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-sm font-medium rounded-lg transition-colors shadow-lg"
                >
                  <Clock className="w-4 h-4 text-purple-400" />
                  History
                </button>
                <button 
                  onClick={saveToLocal}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-purple-500/30 hover:bg-slate-800 text-slate-200 text-sm font-medium rounded-lg transition-colors shadow-lg"
                >
                  <Save className="w-4 h-4 text-purple-400" />
                  Save to Local
                </button>
                <button 
                  onClick={() => {
                    setExportFileName(story.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || "datells-report");
                    setShowExportModal(true);
                  }}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-purple-500/20 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {isExporting ? "Exporting..." : "Export PDF"}
                </button>
                <div className="w-px h-6 bg-slate-800 mx-1 hidden sm:block"></div>
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-sm font-medium rounded-lg transition-colors shadow-lg"
                >
                  Upload New
                </button>
              </div>
            </div>
            
            <div ref={reportRef} className="bg-slate-950 relative z-10 pb-8">
              <DashboardStory story={story} />
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <p className="text-sm font-medium text-slate-200">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Warning Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUploadModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-100">Proceed to a new dataset?</h3>
              </div>
              
              <p className="text-slate-300 mb-8 relative z-10 leading-relaxed text-sm">
                Make sure to save your report first! Any unsaved dashboard insights or configurations will be lost.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 relative z-10">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-transparent hover:bg-slate-800 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-transparent hover:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    saveToLocal();
                    setStory(null);
                    setShowUploadModal(false);
                  }}
                  className="px-4 py-2 bg-slate-800 border border-purple-500/30 hover:border-purple-500/50 hover:bg-slate-800/80 text-purple-300 text-sm font-medium rounded-lg transition-all shadow-lg"
                >
                  Save Report First
                </button>
                <button
                  onClick={() => {
                    setStory(null);
                    setShowUploadModal(false);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-purple-500/20"
                >
                  Proceed
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistoryModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <Clock className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100">Saved Reports</h3>
                </div>
                <button 
                  onClick={() => setShowHistoryModal(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 relative z-10">
                {savedReports.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <p>No saved reports yet.</p>
                  </div>
                ) : (
                  savedReports.map(report => (
                    <div key={report.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/80 hover:border-purple-500/30 transition-all group items-start sm:items-center">
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => loadFromHistory(report.id)} role="button">
                        <h4 className="text-base font-semibold text-slate-200 mb-1 truncate">{report.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          <span className="truncate max-w-[150px]">{report.fileName}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                          <span>{report.rowCount.toLocaleString()} rows</span>
                          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={(e) => { e.stopPropagation(); loadFromHistory(report.id); }}
                          className="px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/20 rounded-lg text-xs font-medium transition-colors"
                        >
                          Load
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteReport(report.id); }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete Report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExportModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <Download className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100">Export Report</h3>
                </div>
                <button 
                  onClick={() => setShowExportModal(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="relative z-10 mb-8">
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  File Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={exportFileName}
                    onChange={(e) => setExportFileName(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                    placeholder="Enter file name..."
                    autoFocus
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500 font-medium">
                    .pdf
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 relative z-10">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 bg-transparent hover:bg-slate-800 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-transparent hover:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => exportToPDF(exportFileName)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-purple-500/20 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

function AnimatedSonar() {
  return (
    <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1200px] aspect-square flex items-center justify-center pointer-events-none [mask-image:radial-gradient(circle_at_center,black_20%,transparent_70%)]">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-purple-500/20"
          style={{
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.1)',
            width: '100%',
            height: '100%',
          }}
          initial={{ opacity: 0, scale: 0.1 }}
          animate={{
            opacity: [0, 0.4, 0],
            scale: [0.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
            delay: i * 2,
          }}
        />
      ))}
    </div>
  );
}
