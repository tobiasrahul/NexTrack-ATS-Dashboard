import React, { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

interface UploadAreaProps {
  onUpload: (files: File[]) => void;
  maxFiles: number;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onUpload, maxFiles }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).slice(0, maxFiles);
      onUpload(files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).slice(0, maxFiles);
      onUpload(files);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative rounded-[2rem] border-2 border-dashed p-10 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden group",
        isDragging 
          ? "border-charcoal bg-charcoal/5" 
          : "border-charcoal/10 bg-card/40 hover:border-charcoal/30 hover:bg-card/60"
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-charcoal flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
          <UploadCloud className="w-8 h-8 text-primary" />
        </div>
        <div>
          <p className="text-xl font-extrabold text-charcoal">
            {isDragging ? "Release to Analyze" : "Drop Resume Here"}
          </p>
          <p className="text-[11px] font-bold text-charcoal/30 uppercase tracking-[0.2em] mt-3">
             PDF ONLY • {maxFiles} MAX
          </p>
        </div>
        <button className="px-8 py-3.5 rounded-full bg-charcoal text-primary text-xs font-black uppercase tracking-widest hover:bg-charcoal/90 transition-all shadow-xl shadow-charcoal/10 active:scale-95">
          Select File
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple={maxFiles > 1}
        accept=".pdf"
        className="hidden"
        onChange={handleChange}
      />
    </motion.div>
  );
};
