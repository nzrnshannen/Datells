"use client";

import React, { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileType, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  onFileUpload: (file: File) => void;
  isLoading?: boolean;
}

export function UploadDropzone({ onFileUpload, isLoading = false }: UploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile.name.endsWith(".csv")) {
          setFile(droppedFile);
          onFileUpload(droppedFile);
        } else {
          alert("Please upload a valid CSV file.");
        }
      }
    },
    [onFileUpload]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFile = e.target.files[0];
        if (selectedFile.name.endsWith(".csv")) {
          setFile(selectedFile);
          onFileUpload(selectedFile);
        } else {
          alert("Please upload a valid CSV file.");
        }
      }
    },
    [onFileUpload]
  );

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300",
          isDragActive
            ? "border-emerald-500 bg-emerald-500/10"
            : "border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-600"
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl pointer-events-none" />

        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-64 cursor-pointer"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 z-10">
            {isLoading ? (
              <Loader2 className="w-12 h-12 mb-4 text-emerald-500 animate-spin" />
            ) : file ? (
              <CheckCircle className="w-12 h-12 mb-4 text-emerald-500" />
            ) : (
              <UploadCloud
                className={cn(
                  "w-12 h-12 mb-4 transition-colors duration-300",
                  isDragActive ? "text-emerald-500" : "text-slate-400 group-hover:text-emerald-400"
                )}
              />
            )}

            <p className="mb-2 text-lg text-slate-300 font-semibold text-center px-4">
              {isLoading ? (
                "Processing dataset locally via DuckDB-Wasm..."
              ) : file ? (
                <span className="text-emerald-400">File attached: {file.name}</span>
              ) : (
                <>
                  <span className="text-emerald-400 font-bold">Click to upload</span> or drag and drop
                </>
              )}
            </p>
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <FileType className="w-4 h-4" /> CSV files only (Locally Processed)
            </p>
          </div>
          <input
            id="dropzone-file"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleChange}
            disabled={isLoading}
          />
        </label>
      </motion.div>
    </div>
  );
}
