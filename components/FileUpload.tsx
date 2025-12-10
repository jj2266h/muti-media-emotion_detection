import React, { useCallback } from 'react';
import { Upload, FileImage, FileVideo } from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, isProcessing }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (isProcessing) return;

      const files = (Array.from(e.dataTransfer.files) as File[]).filter(
        (file) => file.type.startsWith('image/') || file.type.startsWith('video/')
      );
      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [onFilesSelected, isProcessing]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && !isProcessing) {
      const files = Array.from(e.target.files);
      onFilesSelected(files);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`relative group border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ease-in-out cursor-pointer
        ${isProcessing 
          ? 'border-slate-600 bg-slate-800/50 opacity-50 cursor-not-allowed' 
          : 'border-blue-500/50 bg-slate-800/50 hover:bg-slate-800 hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]'
        }
      `}
    >
      <input
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleChange}
        disabled={isProcessing}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className={`p-4 rounded-full bg-slate-700/50 text-blue-400 group-hover:scale-110 transition-transform duration-300`}>
          <Upload size={32} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Upload Photos or Short Videos</h3>
          <p className="text-slate-400 text-sm mt-1">Drag & drop or click to browse</p>
        </div>
        <div className="flex gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1"><FileImage size={12}/> JPG, PNG, WEBP</span>
          <span className="flex items-center gap-1"><FileVideo size={12}/> MP4, WEBM (Short)</span>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;