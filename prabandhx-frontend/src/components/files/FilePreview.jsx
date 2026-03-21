import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, 
  FiDownload, 
  FiShare2, 
  FiChevronLeft, 
  FiChevronRight,
  FiZoomIn,
  FiZoomOut,
  FiRotateCw,
  FiFile
} from 'react-icons/fi';
import { fileService } from '../../services/fileService';
import './Files.css';

const FilePreview = ({ file, onClose, onShare, onDownload }) => {
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadPreview();
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [file]);

  const loadPreview = async () => {
    setLoading(true);
    setError(false);
    
    try {
      const response = await fileService.previewFile(file.id);
      
      if (response.status !== 200) {
        setError(true);
        setLoading(false);
        return;
      }

      const contentType = response.headers['content-type'];
      const blob = new Blob([response.data], { type: contentType });
      const url = URL.createObjectURL(blob);
      
      setPreviewUrl(url);
      setLoading(false);

    } catch (error) {
      console.error('Preview error:', error);
      setError(true);
      setLoading(false);
    }
  };

  const getFileIcon = () => {
    const type = file.fileType?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(type)) {
      return '🖼️';
    }
    if (type === 'pdf') return '📄';
    if (['doc', 'docx'].includes(type)) return '📝';
    if (['xls', 'xlsx'].includes(type)) return '📊';
    if (['ppt', 'pptx'].includes(type)) return '📽️';
    if (['zip', 'rar', '7z'].includes(type)) return '🗜️';
    return '📁';
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const isImage = () => {
    const type = file.fileType?.toLowerCase() || '';
    const mime = file.mimeType?.toLowerCase() || '';
    return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(type) || 
           mime.startsWith('image/');
  };

  const isPDF = () => {
    return file.mimeType === 'application/pdf' || file.fileType?.toLowerCase() === 'pdf';
  };

  const isVideo = () => {
    return file.mimeType?.startsWith('video/') || 
           ['mp4', 'webm', 'ogg'].includes(file.fileType?.toLowerCase());
  };

  const isAudio = () => {
    return file.mimeType?.startsWith('audio/') || 
           ['mp3', 'wav', 'ogg'].includes(file.fileType?.toLowerCase());
  };

  const handleRetry = () => {
    loadPreview();
  };

  return (
    <motion.div
      className="preview-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="preview-modal-content"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Preview Header */}
        <div className="preview-header">
          <div className="preview-file-info">
            <span className="preview-file-icon">{getFileIcon()}</span>
            <div className="preview-file-details">
              <h3>{file.fileName}</h3>
              <p>{file.fileSizeDisplay} • {file.fileType}</p>
            </div>
          </div>
          <div className="preview-actions">
            {isImage() && (
              <>
                <button onClick={handleZoomIn} title="Zoom In">
                  <FiZoomIn />
                </button>
                <button onClick={handleZoomOut} title="Zoom Out">
                  <FiZoomOut />
                </button>
                <button onClick={handleRotate} title="Rotate">
                  <FiRotateCw />
                </button>
                <span className="zoom-level">{zoom}%</span>
              </>
            )}
            {isPDF() && (
              <div className="pdf-controls">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <FiChevronLeft />
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <FiChevronRight />
                </button>
              </div>
            )}
            <button onClick={() => onDownload(file)} title="Download">
              <FiDownload />
            </button>
            <button onClick={() => onShare(file)} title="Share">
              <FiShare2 />
            </button>
            <button onClick={onClose} title="Close" className="close-preview">
              <FiX />
            </button>
          </div>
        </div>

        {/* Preview Body */}
        <div className="preview-body">
          {loading ? (
            <div className="preview-loading">
              <div className="spinner"></div>
              <p>Loading preview...</p>
            </div>
          ) : error ? (
            <div className="preview-error">
              <FiFile className="error-icon" />
              <h4>Failed to load preview</h4>
              <p>There was an error loading this file.</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button 
                  className="download-btn"
                  onClick={handleRetry}
                >
                  Retry
                </button>
                <button 
                  className="download-btn"
                  onClick={() => onDownload(file)}
                >
                  <FiDownload /> Download Instead
                </button>
              </div>
            </div>
          ) : (
            <>
              {isImage() && previewUrl && (
                <div 
                  className="image-preview-container"
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <img 
                    src={previewUrl} 
                    alt={file.fileName}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>
              )}

              {isPDF() && previewUrl && (
                <iframe
                  src={previewUrl}
                  title={file.fileName}
                  className="pdf-preview"
                />
              )}

              {isVideo() && previewUrl && (
                <video controls className="video-preview">
                  <source src={previewUrl} type={file.mimeType || 'video/mp4'} />
                </video>
              )}

              {isAudio() && previewUrl && (
                <audio controls className="audio-preview">
                  <source src={previewUrl} type={file.mimeType || 'audio/mpeg'} />
                </audio>
              )}

              {!isImage() && !isPDF() && !isVideo() && !isAudio() && (
                <div className="unsupported-preview">
                  <FiFile className="unsupported-icon" />
                  <h4>Preview not available</h4>
                  <p>This file type cannot be previewed.</p>
                  <button 
                    className="download-btn"
                    onClick={() => onDownload(file)}
                  >
                    <FiDownload /> Download File
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FilePreview;