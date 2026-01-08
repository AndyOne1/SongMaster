import React from 'react';

interface SaveWarningDialogProps {
  isOpen: boolean;
  onSaveAndContinue: () => void;
  onProceedWithoutSaving: () => void;
  onCancel: () => void;
}

export function SaveWarningDialog({
  isOpen,
  onSaveAndContinue,
  onProceedWithoutSaving,
  onCancel,
}: SaveWarningDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-semibold text-white">Song Not Saved</h2>
        </div>

        <p className="text-gray-300 mb-6">
          Iteration will start with this song, but it won&apos;t be saved to your library.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onSaveAndContinue}
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Save Song & Continue
          </button>
          <button
            onClick={onProceedWithoutSaving}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Proceed without Saving
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-transparent border border-gray-600 hover:bg-gray-800 text-gray-300 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
