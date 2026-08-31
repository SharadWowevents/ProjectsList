import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  FileJson, 
  Check, 
  AlertCircle,
  Loader2 // <-- Added for loading state
} from 'lucide-react';
import { Project, ProjectTypeItem } from '../types';
import { exportProjectsToCSV, exportProjectsToJSON } from '../utils/helpers';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  types: ProjectTypeItem[];
  // Updated to support an async backend call
  onImportData: (importedProjects: Project[], importedTypes?: ProjectTypeItem[], replaceExisting?: boolean) => Promise<void> | void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  projects,
  types,
  onImportData,
}) => {
  const [importJsonText, setImportJsonText] = useState('');
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); // <-- Track backend request state

  if (!isOpen) return null;

  // Exports can remain synchronous since they just format the data already loaded in the frontend
  const handleExportCSV = () => {
    exportProjectsToCSV(projects);
  };

  const handleExportJSON = () => {
    exportProjectsToJSON(projects, types);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setImportJsonText(text);
        setError('');
      } catch (err) {
        setError('Failed to read file.');
      }
    };
    reader.readAsText(file);
  };

  const handleProcessImport = async () => {
    if (!importJsonText.trim()) {
      setError('Please paste JSON data or select a file.');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const parsed = JSON.parse(importJsonText);
      let incomingProjects: Project[] = [];
      let incomingTypes: ProjectTypeItem[] | undefined;

      if (Array.isArray(parsed)) {
        incomingProjects = parsed;
      } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.projects)) {
        incomingProjects = parsed.projects;
        if (Array.isArray(parsed.types)) {
          incomingTypes = parsed.types;
        }
      } else {
        throw new Error('Invalid format. Expected JSON array of projects or backup object with projects array.');
      }

      if (incomingProjects.length === 0) {
        throw new Error('No projects found in the provided JSON.');
      }

      // Await the backend API call from the parent
      await onImportData(incomingProjects, incomingTypes, replaceExisting);
      
      setSuccess(`Successfully imported ${incomingProjects.length} projects!`);
      setTimeout(() => {
        onClose();
        // Reset state after closing
        setTimeout(() => {
          setSuccess('');
          setImportJsonText('');
        }, 200);
      }, 1500);

    } catch (err: any) {
      setError(`Import error: ${err.message || 'Malformed JSON or Server Error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#141414]/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-[#E4E3E0] rounded-xs max-w-lg w-full shadow-2xl border border-[#141414] overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#141414]/25 bg-[#E4E3E0]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-xs bg-[#141414]/5 border border-[#141414]/15 text-[#141414] flex items-center justify-center">
              <Download className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#141414]/55">
                PORTABILITY & BACKUPS
              </div>
              <h2 className="text-xl font-serif font-medium text-[#141414]">
                Data Export & Backup
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 rounded-xs text-[#141414]/60 hover:text-[#141414] hover:bg-[#141414]/10 border border-transparent hover:border-[#141414]/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 font-mono text-xs">
          
          {/* Export Section */}
          <div className={isProcessing ? 'opacity-50 pointer-events-none' : ''}>
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#141414]/70 mb-2">
              EXPORT DATA ({projects.length} RECORDS TOTAL)
            </h3>
            
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleExportCSV}
                className="p-3 bg-white/95 rounded-xs border border-[#141414]/25 hover:border-[#141414] hover:bg-white text-left transition-all group flex flex-col justify-between cursor-pointer"
              >
                <div className="w-6 h-6 rounded-xs bg-[#141414]/5 border border-[#141414]/15 text-[#141414] flex items-center justify-center mb-2">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block text-xs font-bold font-mono text-[#141414] uppercase">
                    Export to CSV
                  </span>
                  <span className="text-[10px] text-[#141414]/60">
                    Sheets & Excel ready format
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleExportJSON}
                className="p-3 bg-white/95 rounded-xs border border-[#141414]/25 hover:border-[#141414] hover:bg-white text-left transition-all group flex flex-col justify-between cursor-pointer"
              >
                <div className="w-6 h-6 rounded-xs bg-[#141414]/5 border border-[#141414]/15 text-[#141414] flex items-center justify-center mb-2">
                  <FileJson className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block text-xs font-bold font-mono text-[#141414] uppercase">
                    Backup JSON
                  </span>
                  <span className="text-[10px] text-[#141414]/60">
                    Full backup with categories
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="border-t border-[#141414]/20 pt-4 space-y-2.5">
            <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#141414]/70">
              RESTORE / IMPORT DATA
            </h3>

            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-300 text-rose-800 text-xs rounded-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xs flex items-center gap-2">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#141414]/70 mb-1">
                Upload Backup JSON File:
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="block w-full text-xs text-[#141414]/80 file:mr-3 file:py-1 file:px-2.5 file:rounded-xs file:border file:border-[#141414]/30 file:text-[11px] file:font-mono file:font-bold file:bg-[#141414] file:text-[#E4E3E0] hover:file:bg-[#252525] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#141414]/70 mb-1">
                Or paste JSON payload directly:
              </label>
              <textarea
                rows={3}
                value={importJsonText}
                disabled={isProcessing}
                onChange={(e) => {
                  setImportJsonText(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Paste projects JSON array or backup payload..."
                className="w-full font-mono text-xs p-2 bg-white/95 border border-[#141414]/25 rounded-xs outline-none focus:border-[#141414] disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="replace-existing-checkbox"
                checked={replaceExisting}
                disabled={isProcessing}
                onChange={(e) => setReplaceExisting(e.target.checked)}
                className="accent-[#141414] disabled:opacity-50"
              />
              <label htmlFor="replace-existing-checkbox" className={`text-xs font-mono ${isProcessing ? 'text-[#141414]/40' : 'text-[#141414]/80'}`}>
                Replace all existing projects (unchecked = merge)
              </label>
            </div>

            <button
              type="button"
              onClick={handleProcessImport}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-4 bg-[#141414] hover:bg-[#252525] text-[#E4E3E0] text-xs font-mono font-bold uppercase tracking-wider rounded-xs border border-[#141414] transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Import Data Payload</span>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};