import React from 'react';
import { FileText, Image, File as FileIcon } from 'lucide-react';
import { formatFileSize, getFileTypeDisplay } from '../lib/fileParser';

interface FilePreviewProps {
  file: File;
  onRemove?: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => {
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-8 h-8 text-blue-500" />;
    } else if (file.type.includes('pdf')) {
      return <FileText className="w-8 h-8 text-red-500" />;
    } else if (file.type.includes('word') || file.type.includes('document')) {
      return <FileText className="w-8 h-8 text-blue-600" />;
    } else {
      return <FileIcon className="w-8 h-8 text-gray-500" />;
    }
  };

  const getFileColor = (file: File) => {
    if (file.type.startsWith('image/')) {
      return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
    } else if (file.type.includes('pdf')) {
      return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
    } else if (file.type.includes('word') || file.type.includes('document')) {
      return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
    } else {
      return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800';
    }
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border-2 ${getFileColor(file)} transition-colors`}>
      {getFileIcon(file)}
      <div className="flex-1 min-w-0">
        <p className="font-mono font-bold text-sm dark:text-white truncate">
          {file.name}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{getFileTypeDisplay(file)}</span>
          <span>•</span>
          <span>{formatFileSize(file.size)}</span>
        </div>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          title="Remove file"
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default FilePreview;