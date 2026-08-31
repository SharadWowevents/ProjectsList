import React, { useState } from 'react';
import { Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Project } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Updated to support async operations for the backend API call
  onConfirm: () => Promise<void> | void; 
  project: Project | null;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  project,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !project) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err: any) {
      setError(err.message || 'Failed to delete project. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#141414]/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-[#E4E3E0] rounded-xs max-w-sm w-full shadow-2xl border border-[#141414] overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
      >
        <div className="p-5 text-center space-y-3 font-mono">
          <div className="w-9 h-9 rounded-xs bg-rose-500/10 border border-rose-600/30 text-rose-800 flex items-center justify-center mx-auto">
            <Trash2 className="w-4 h-4" />
          </div>
          
          <div>
            <div className="text-[10px] uppercase tracking-widest text-rose-800 font-bold">
              CONFIRM DELETION
            </div>
            <h3 className="text-lg font-serif font-medium text-[#141414]">
              Delete Project Record?
            </h3>
          </div>
          
          <p className="text-xs text-[#141414]/70 font-mono">
            Are you sure you want to permanently delete <span className="font-bold text-[#141414]">"{project.name}"</span>?
          </p>

          {/* Backend Error Display */}
          {error && (
            <div className="flex items-center gap-1.5 p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xs text-left">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 text-xs font-mono font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-1.5 px-3 bg-white hover:bg-[#141414]/5 text-[#141414] border border-[#141414]/25 rounded-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="flex-1 py-1.5 px-3 bg-rose-800 hover:bg-rose-900 text-white border border-rose-900 rounded-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Confirm Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};