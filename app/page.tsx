"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UploadDropzone } from "@/components/upload-dropzone";
import { DashboardStory } from "@/components/dashboard-story";
import { profileDataset } from "@/lib/profiler";
import { StoryData } from "@/lib/schema";
import { Database, Sparkles } from "lucide-react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [story, setStory] = useState<StoryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setStory(null);

    try {
      // 1. Profile dataset locally with DuckDB
      console.log("Profiling dataset...");
      const datasetSummary = await profileDataset(file);
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

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
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
        {/* Subtle Dot Matrix Grid */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(circle at 50% 40%, black 20%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(circle at 50% 40%, black 20%, transparent 80%)"
          }}
        />
        {/* Sonar Rings */}
        <AnimatedSonar />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16 flex flex-col items-center">
        {!story ? (
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center mt-12 md:mt-24">
            <div className="inline-flex items-center justify-center p-4 bg-slate-900 border border-slate-800 rounded-2xl mb-8 shadow-2xl relative">
              <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
              <Database className="w-10 h-10 text-purple-400 relative z-10" />
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-sans font-bold tracking-tight text-center mb-6 text-white">
              Datells
            </h1>
            <p className="font-sans text-base md:text-lg text-slate-300 text-center max-w-2xl mb-12 leading-relaxed">
              Drop any CSV to instantly generate a comprehensive, AI-powered interactive data story dashboard. Processed securely in your browser.
            </p>

            <UploadDropzone onFileUpload={handleFileUpload} isLoading={isLoading} />
            
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
              <button 
                onClick={() => setStory(null)}
                className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-sm font-medium rounded-lg transition-colors shadow-lg"
              >
                Upload New Dataset
              </button>
            </div>
            <DashboardStory story={story} />
          </div>
        )}
      </div>
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
