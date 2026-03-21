import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiDownload,
  FiEye,
  FiShare2,
  FiTrash2,
  FiCopy,
  FiClock,
  FiUser,
  FiFile,
  FiImage,
  FiArchive,
  FiCode
} from 'react-icons/fi';
import { fileService } from '../../services/fileService';
import FileShareModal from './FileShareModal';
import FileVersionHistory from './FileVersionHistory';
import FilePreview from './FilePreview'; // 👈 IMPORT THIS!
import toast from 'react-hot-toast';
import './Files.css';

const FileCard = ({ file, onDelete, onVersionUpdate }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showPreview, setShowPreview] = useState(false); // 👈 ADD THIS STATE
  const [deleting, setDeleting] = useState(false);

  const getFileIcon = () => {
    const type = file.fileType?.toLowerCase() || '';
    const mime = file.mimeType?.toLowerCase() || '';
    
    if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif'].includes(type)) {
      return <FiImage className="file-icon image" />;
    }
    if (type === 'pdf' || mime.includes('pdf')) {
      return <FiFile className="file-icon pdf" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(type) || mime.includes('zip')) {
      return <FiArchive className="file-icon archive" />;
    }
    if (['js', 'jsx', 'ts', 'tsx', 'json', 'html', 'css'].includes(type) || 
        mime.includes('javascript') || mime.includes('json')) {
      return <FiCode className="file-icon code" />;
    }
    return <FiFile className="file-icon default" />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleDownload = async () => {
    try {
      toast.loading('Downloading...', { id: 'download' });
      await fileService.downloadFile(file.id, file.fileName);
      toast.success('Download started', { id: 'download' });
    } catch (error) {
      toast.error('Failed to download file', { id: 'download' });
      console.error('Download error:', error);
    }
  };

  const handlePreview = async () => {
    try {
      setShowPreview(true); // 👈 OPEN PREVIEW MODAL
    } catch (error) {
      toast.error('Failed to preview file');
      console.error('Preview error:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      setDeleting(true);
      try {
        await fileService.deleteFile(file.id);
        toast.success('File deleted successfully');
        if (onDelete) onDelete(file.id);
      } catch (error) {
        toast.error('Failed to delete file');
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleCopyLink = () => {
    if (file.shareableLink) {
      const link = `${window.location.origin}/shared/${file.shareableLink}`;
      navigator.clipboard.writeText(link);
      toast.success('Link copied to clipboard');
    }
  };

  const handleShare = () => {
    setShowShareModal(true); // 👈 OPEN SHARE MODAL
  };

  return (
    <>
      <motion.div
        className={`file-card ${file.isExpired ? 'expired' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)' }}
      >
        <div className="file-card-header">
          {getFileIcon()}
          <div className="file-info">
            <h4 className="file-name" title={file.fileName}>
              {file.fileName}
            </h4>
            <div className="file-meta">
              <span className="file-size">{file.fileSizeDisplay}</span>
              <span className="file-type">{file.fileType}</span>
              {file.version > 1 && (
                <span className="file-version">v{file.version}</span>
              )}
            </div>
          </div>
        </div>

        <div className="file-details">
          <div className="detail-item">
            <FiUser className="detail-icon" />
            <span>{file.uploadedByName || 'Unknown'}</span>
          </div>
          <div className="detail-item">
            <FiClock className="detail-icon" />
            <span>{formatDate(file.uploadedAt)}</span>
          </div>
          {file.downloadCount > 0 && (
            <div className="detail-item">
              <FiDownload className="detail-icon" />
              <span>{file.downloadCount} downloads</span>
            </div>
          )}
        </div>

        {file.projectName && (
          <div className="file-project">
            Project: {file.projectName}
          </div>
        )}

        {file.shareableLink && (
          <div className="file-share-info">
            <span className={`share-badge ${file.permissions.toLowerCase()}`}>
              {file.permissions}
            </span>
            {file.linkExpiry && (
              <span className="expiry-badge">
                Expires: {new Date(file.linkExpiry).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        <div className="file-actions">
          <button
            onClick={handlePreview}
            className="action-btn preview"
            title="Preview"
          >
            <FiEye />
          </button>
          <button
            onClick={handleDownload}
            className="action-btn download"
            title="Download"
          >
            <FiDownload />
          </button>
          <button
            onClick={handleShare}
            className="action-btn share"
            title="Share"
          >
            <FiShare2 />
          </button>
          {file.version > 1 && (
            <button
              onClick={() => setShowVersions(true)}
              className="action-btn versions"
              title="Versions"
            >
              <FiClock /> v{file.version}
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="action-btn delete"
            title="Delete"
          >
            <FiTrash2 />
          </button>
        </div>

        {file.shareableLink && (
          <button onClick={handleCopyLink} className="copy-link-btn">
            <FiCopy /> Copy Share Link
          </button>
        )}
      </motion.div>

      {/* Preview Modal */}
      {showPreview && (
        <FilePreview
          file={file}
          onClose={() => setShowPreview(false)}
          onShare={() => {
            setShowPreview(false);
            setShowShareModal(true);
          }}
          onDownload={handleDownload}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <FileShareModal
          file={file}
          onClose={() => setShowShareModal(false)}
          onShare={(updatedFile) => {
            setShowShareModal(false);
            if (onVersionUpdate) onVersionUpdate(updatedFile);
          }}
        />
      )}

      {/* Versions Modal */}
      {showVersions && (
        <FileVersionHistory
          fileId={file.id}
          fileName={file.fileName}
          onClose={() => setShowVersions(false)}
          onVersionSelect={(version) => {
            if (onVersionUpdate) onVersionUpdate(version);
          }}
        />
      )}
    </>
  );
};

export default FileCard;