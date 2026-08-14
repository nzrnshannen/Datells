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
    <div className="w-full max-w-2xl mx-auto mt-10" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        className={cn(
          "p-10 block rounded-2xl cursor-pointer w-full relative overflow-hidden border border-slate-800 transition-colors",
          isDragActive ? "bg-slate-900/80 border-purple-500/50" : "bg-slate-900/40 hover:bg-slate-900/60"
        )}
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
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none">
          <GridPattern />
        </div>
        <div className="flex flex-col items-center justify-center relative z-10">
          <p className="font-sans font-bold text-slate-100 text-xl tracking-tight">
            {isLoading ? "Analyzing Dataset" : "Upload Dataset"}
          </p>
          <p className="font-sans font-normal text-slate-400 text-sm mt-2 max-w-sm text-center">
            {isLoading 
              ? "Processing your CSV locally using DuckDB-Wasm..." 
              : "Drag or drop your CSV file here or click to upload. Files are processed securely in your browser."}
          </p>
          
          <div className="relative w-full mt-10 max-w-xl mx-auto">
            {file && (
              <motion.div
                key="file-upload"
                layoutId="file-upload"
                className={cn(
                  "relative overflow-hidden z-40 bg-slate-900/80 backdrop-blur-md flex flex-col items-start justify-start p-4 mt-4 w-full mx-auto rounded-xl border border-purple-500/30",
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
                className="group/btn relative w-full max-w-[8rem] mx-auto mt-4 h-32"
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
                    "absolute inset-0 group-hover/btn:shadow-2xl z-40 bg-slate-800 flex items-center justify-center w-full rounded-xl border border-slate-700",
                    "shadow-[0px_10px_50px_rgba(0,0,0,0.3)] transition-shadow"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 text-purple-400 animate-spin" />
                  ) : isDragActive ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-purple-400 flex flex-col items-center gap-2 font-medium"
                    >
                      Drop it
                      <IconUpload className="h-6 w-6 text-purple-400" />
                    </motion.p>
                  ) : (
                    <IconUpload className="h-6 w-6 text-slate-400 group-hover/btn:text-purple-400 transition-colors" />
                  )}
                </motion.div>

                {!isLoading && (
                  <motion.div
                    variants={secondaryVariant}
                    className="absolute opacity-0 border border-dashed border-purple-500/50 inset-0 z-30 bg-transparent flex items-center justify-center w-full rounded-xl"
                  />
                )}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-slate-950 flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105 opacity-20">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex flex-shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-slate-900"
                  : "bg-slate-900 shadow-[0px_0px_1px_3px_rgba(0,0,0,0.5)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}
