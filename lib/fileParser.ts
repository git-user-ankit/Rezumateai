export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileTypeDisplay = (file: File): string => {
  if (file.type === 'application/pdf') return 'PDF';
  if (file.type.includes('image')) return 'Image';
  if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) return 'Word';
  if (file.type.includes('text')) return 'Text';
  return file.name.split('.').pop()?.toUpperCase() || 'FILE';
};

export const isFileTypeSupported = (file: File): boolean => {
    const supportedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
        'application/msword', // doc
        'text/plain',
        'image/jpeg',
        'image/png'
    ];
    return supportedTypes.includes(file.type) || file.name.endsWith('.pdf') || file.name.endsWith('.docx') || file.name.endsWith('.doc') || file.name.endsWith('.txt');
};

export const getSupportedFileExtensions = (): string => {
    return ".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png";
};

export interface ParseResult {
    success: boolean;
    content: string; // Base64 content
    fileType: string;
    fileName: string;
    fileSize: number;
    error?: string;
}

export const parseResumeFile = async (file: File, onProgress?: (progress: number, status: string) => void): Promise<ParseResult> => {
    return new Promise((resolve) => {
        if (onProgress) onProgress(10, `Reading ${file.name}...`);
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            if (e.target?.result) {
                if (onProgress) onProgress(100, "File read successfully");
                
                // Return base64 string without the data URL prefix
                const result = e.target.result as string;
                const base64Content = result.split(',')[1];
                
                resolve({
                    success: true,
                    content: base64Content,
                    fileType: getFileTypeDisplay(file),
                    fileName: file.name,
                    fileSize: file.size
                });
            } else {
                resolve({
                    success: false,
                    content: '',
                    fileType: getFileTypeDisplay(file),
                    fileName: file.name,
                    fileSize: file.size,
                    error: "Failed to read file content"
                });
            }
        };

        reader.onerror = () => {
            resolve({
                success: false,
                content: '',
                fileType: getFileTypeDisplay(file),
                fileName: file.name,
                fileSize: file.size,
                error: "FileReader error"
            });
        };

        reader.readAsDataURL(file);
    });
};