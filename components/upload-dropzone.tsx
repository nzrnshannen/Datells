import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { Loader2 } from "lucide-react";

const mainVariant = {
  initial: { x: 0, y: 0 },
  animate: { x: 0, y: -20, opacity: 0.9 },
};

const secondaryVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

interface UploadDropzoneProps {
  onFileUpload: (file: File) => void;
  isLoading?: boolean;
}

export function UploadDropzone({ onFileUpload, isLoading = false }: UploadDropzoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    if (newFiles.length > 0) {
      const selectedFile = newFiles[0];
      if (selectedFile.name.endsWith(".csv")) {
        setFile(selectedFile);
        onFileUpload(selectedFile);
      } else {
        alert("Please upload a valid CSV file.");
      }
    }
  };

  const handleClick = () => {
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    accept: { 'text/csv': ['.csv'] },
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error);
    },
    disabled: isLoading,
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        className="py-4 block cursor-pointer w-full relative transition-colors"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          accept=".csv"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
          disabled={isLoading}
        />

        <div className="flex flex-col items-center justify-center relative z-10 w-full">
          <div className="relative w-full max-w-xl mx-auto mb-8">
            {file && (
              <motion.div
                key="file-upload"
                layoutId="file-upload"
                className={cn(
                  "relative overflow-hidden z-40 bg-slate-900/80 backdrop-blur-md flex flex-col items-start justify-start p-4 w-full mx-auto rounded-xl border border-purple-500/30",
                  "shadow-[0px_0px_30px_rgba(168,85,247,0.1)]"
                )}
              >
                <div className="flex justify-between w-full items-center gap-4">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    layout
                    className="text-base text-slate-200 truncate max-w-[200px] md:max-w-xs font-medium"
                  >
                    {file.name}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    layout
                    className="rounded-md px-2 py-1 w-fit flex-shrink-0 text-xs font-semibold bg-slate-800 text-slate-300 shadow-inner"
                  >
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </motion.p>
                </div>

                <div className="flex text-xs md:flex-row flex-col items-start md:items-center w-full mt-4 justify-between text-slate-400">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    layout
                    className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700/50 uppercase tracking-wider"
                  >
                    CSV
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    layout
                  >
                    Modified {new Date(file.lastModified).toLocaleDateString()}
                  </motion.p>
                </div>
              </motion.div>
            )}

            {!file && (
              <motion.div
                whileHover={!isLoading ? "animate" : undefined}
                className="group/btn relative mx-auto h-24 w-24"
              >
                <motion.div
                  layoutId="file-upload"
                  variants={mainVariant}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className={cn(
                    "absolute inset-0 z-40 flex items-center justify-center rounded-full",
                    "bg-slate-900/40 backdrop-blur-sm border border-slate-700/50",
                    "shadow-[0px_4px_20px_rgba(0,0,0,0.2)] transition-all duration-300",
                    "group-hover/btn:bg-slate-800/80 group-hover/btn:border-purple-500/50 group-hover/btn:scale-105 group-hover/btn:shadow-[0px_0px_30px_rgba(168,85,247,0.3)]",
                    isDragActive ? "bg-slate-800/90 border-purple-500/60 scale-110 shadow-[0px_0px_40px_rgba(168,85,247,0.5)] animate-pulse" : ""
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
                  ) : isDragActive ? (
                    <IconUpload className="h-8 w-8 text-purple-400" />
                  ) : (
                    <IconUpload className="h-8 w-8 text-slate-400 group-hover/btn:text-purple-400 transition-colors" />
                  )}
                </motion.div>

                {!isLoading && (
                  <motion.div
                    variants={secondaryVariant}
                    className="absolute opacity-0 border border-dashed border-purple-500/50 inset-0 z-30 bg-transparent rounded-full"
                  />
                )}
              </motion.div>
            )}
          </div>

          <p className="font-sans font-semibold text-white text-xl tracking-tight">
            {isLoading ? "Analyzing Dataset" : "Upload Dataset"}
          </p>
          <p className="font-sans text-xs text-slate-400 mt-2 max-w-sm text-center">
            {isLoading 
              ? "Processing your CSV locally using DuckDB-Wasm..." 
              : "Drag or drop your CSV file here or click to upload. Files are processed securely in your browser."}
          </p>
        </div>
      </motion.div>
    </div>
  );
}


