import React, { useState, useEffect } from 'react';
import { Upload, Camera, BarChart3, ChevronRight, Github, X, Trash2 } from 'lucide-react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import ProcessingState from './components/ProcessingState';
import FaceList from './components/FaceList';
import { analyzeImage } from './services/geminiService';
import { FileWithPreview, AnalysisResult } from './types';

const App: React.FC = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0); // 0-3

  // Handle file selection
  const handleFilesSelected = (selectedFiles: File[]) => {
    const newFiles = selectedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substring(7),
      status: 'idle' as const
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  // Remove a single file
  const removeFile = (id: string) => {
    if (isProcessing) return; // Prevent removal during processing
    setFiles(prev => {
      const target = prev.find(f => f.id === id);
      if (target) URL.revokeObjectURL(target.preview); // Cleanup memory
      return prev.filter(f => f.id !== id);
    });
    // Also remove associated results if they exist
    setResults(prev => prev.filter(r => r.fileId !== id));
  };

  // Clear all files
  const clearQueue = () => {
    if (isProcessing) return;
    files.forEach(f => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setResults([]);
    setPipelineStep(0);
  };

  // Run analysis pipeline
  const runAnalysis = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setResults([]); // Optional: Clear previous results or append? Current logic clears.
    
    // Simulate pipeline visuals
    setPipelineStep(1); // Detection
    await new Promise(r => setTimeout(r, 800));
    setPipelineStep(2); // Alignment
    await new Promise(r => setTimeout(r, 800));
    setPipelineStep(3); // Inference (Real API Call triggers here)

    const newResults: AnalysisResult[] = [];
    
    // Process sequentially for the demo to show progress, or Promise.all for speed
    for (const fileObj of files) {
      if (fileObj.status === 'done') continue;

      try {
        const result = await analyzeImage(fileObj.file, fileObj.id);
        newResults.push(result);
        
        // Update file status
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'done' } : f));
      } catch (error) {
        console.error("Error processing file", fileObj.id, error);
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'error' } : f));
      }
    }

    setResults(prev => [...prev, ...newResults]);
    setPipelineStep(0);
    setIsProcessing(false);
  };

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      files.forEach(f => URL.revokeObjectURL(f.preview));
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Camera size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              FaceSense AI
            </span>
          </div>
          <div className="flex items-center space-x-6 text-sm text-slate-400">
             <a href="#" className="hover:text-blue-400 transition-colors">Documentation</a>
             <a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2">
               <Github size={16}/> Source
             </a>
          </div>
        </div>
      </nav>

      {/* Hero / Input Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Emotion & Demographic Intelligence
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Upload images or short video frames to analyze Ekman emotions and age distributions using advanced computer vision.
          </p>
        </div>

        {/* Action Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Upload */}
          <div className="lg:col-span-1 space-y-6">
            <FileUpload onFilesSelected={handleFilesSelected} isProcessing={isProcessing} />
            
            {/* File Queue List */}
            {files.length > 0 && (
              <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-slate-300">Queue ({files.length})</h3>
                    {!isProcessing && (
                      <button 
                        onClick={clearQueue} 
                        className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-slate-700/50"
                        title="Clear all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={runAnalysis}
                    disabled={isProcessing || files.every(f => f.status === 'done')}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
                  >
                    {isProcessing ? 'Processing...' : 'Run Analysis'}
                    {!isProcessing && <ChevronRight size={14} />}
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-2 space-y-2">
                  {files.map((f) => (
                    <div key={f.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/30 transition-colors group relative pr-8">
                      <div className="h-10 w-10 rounded overflow-hidden bg-black flex-shrink-0">
                        {f.file.type.startsWith('video') ? (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 text-[10px]">Video</div>
                        ) : (
                          <img src={f.preview} alt="preview" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{f.file.name}</p>
                        <p className="text-xs text-slate-500">{(f.file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <div className="text-xs">
                         {f.status === 'done' && <span className="text-green-400">Done</span>}
                         {f.status === 'processing' && <span className="text-blue-400 animate-pulse">...</span>}
                         {f.status === 'error' && <span className="text-red-400">Error</span>}
                         {f.status === 'idle' && <span className="text-slate-600">Ready</span>}
                      </div>

                      {/* Remove Button */}
                      {!isProcessing && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove file"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Visualization Area */}
          <div className="lg:col-span-2">
            <ProcessingState currentStep={pipelineStep} />
            
            {results.length > 0 ? (
               <div className="mt-6 space-y-6">
                 <Dashboard results={results} />
                 
                 {/* Individual File Breakdowns */}
                 <div className="border-t border-slate-700/50 pt-6">
                   <h3 className="text-xl font-bold text-white mb-4">Individual Frame Analysis</h3>
                   {results.map((res) => (
                     <FaceList key={res.fileId} faces={res.faces} fileName={res.fileName} />
                   ))}
                 </div>
               </div>
            ) : (
              // Empty State
              !isProcessing && (
                <div className="h-full flex flex-col items-center justify-center min-h-[400px] border border-slate-800 rounded-2xl bg-slate-800/20 text-slate-500">
                   <BarChart3 size={48} className="mb-4 opacity-50" />
                   <p className="text-lg font-medium">No Analysis Results Yet</p>
                   <p className="text-sm">Upload media and click "Run Analysis" to see demographics and emotion metrics.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;