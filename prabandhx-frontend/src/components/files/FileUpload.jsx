import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiX, FiFile, FiImage, FiArchive, FiCode } from 'react-icons/fi';
import { fileService } from '../../services/fileService';
import toast from 'react-hot-toast';
import './Files.css';

const FileUpload = ({ projectId, taskId, onUploadSuccess }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <FiImage />;
    if (fileType.includes('pdf')) return <FiFile />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <FiArchive />;
    if (fileType.includes('javascript') || fileType.includes('json')) return <FiCode />;
    return <FiFile />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true
  });

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadFiles = async () => {
    setUploading(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        setUploadProgress(prev => ({ ...prev, [file.id]: 0 }));
        
        // Simulate progress (actual progress tracking would require XMLHttpRequest)
        const interval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [file.id]: Math.min((prev[file.id] || 0) + 10, 90)
          }));
        }, 200);

        const response = await fileService.uploadFile(file.file, projectId, taskId);
        
        clearInterval(interval);
        setUploadProgress(prev => ({ ...prev, [file.id]: 100 }));
        
        setTimeout(() => {
          setFiles(prev => prev.filter(f => f.id !== file.id));
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[file.id];
            return newProgress;
          });
        }, 1000);

        toast.success(`${file.name} uploaded successfully`);
        
        if (onUploadSuccess) {
          onUploadSuccess(response.data);
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${file.name}`);
        setUploadProgress(prev => ({ ...prev, [file.id]: 0 }));
      }
    }
    
    setUploading(false);
  };

  return (
    <div className="file-upload-container">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${uploading ? 'disabled' : ''}`}
      >
        <input {...getInputProps()} disabled={uploading} />
        <FiUpload className="upload-icon" />
        {isDragActive ? (
          <p>Drop files here...</p>
        ) : (
          <>
            <p className="upload-title">Drag & drop files here</p>
            <p className="upload-subtitle">or click to browse</p>
            <p className="upload-hint">Max file size: 50MB</p>
          </>
        )}
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="file-list"
          >
            <h4>Files to upload ({files.length})</h4>
            
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="file-item"
              >
                <div className="file-info">
                  <span className="file-icon">{getFileIcon(file.type)}</span>
                  <div className="file-details">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                </div>
                
                {uploadProgress[file.id] ? (
                  <div className="file-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${uploadProgress[file.id]}%` }}
                      />
                    </div>
                    <span className="progress-text">{uploadProgress[file.id]}%</span>
                  </div>
                ) : (
                  <button
                    onClick={() => removeFile(file.id)}
                    className="remove-file-btn"
                    disabled={uploading}
                  >
                    <FiX />
                  </button>
                )}
              </motion.div>
            ))}

            {files.length > 0 && (
              <button
                onClick={uploadFiles}
                disabled={uploading}
                className="upload-btn"
              >
                {uploading ? 'Uploading...' : `Upload ${files.length} file${files.length > 1 ? 's' : ''}`}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;