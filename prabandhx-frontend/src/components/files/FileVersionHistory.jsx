import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiDownload, FiEye, FiClock, FiUser, FiArrowLeft } from 'react-icons/fi';
import { fileService } from '../../services/fileService';
import toast from 'react-hot-toast';
import './Files.css';

const FileVersionHistory = ({ fileId, fileName, onClose, onVersionSelect }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVersions();
  }, [fileId]);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const response = await fileService.getFileVersions(fileId);
      setVersions(response.data);
    } catch (error) {
      toast.error('Failed to load versions');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadVersion = async (versionId, versionName) => {
    try {
      await fileService.downloadFile(versionId, versionName);
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download');
    }
  };

  const handlePreviewVersion = async (versionId) => {
    try {
      await fileService.previewFile(versionId);
    } catch (error) {
      toast.error('Failed to preview');
    }
  };

  const handleRestoreVersion = (version) => {
    if (window.confirm(`Restore version ${version.version}?`)) {
      if (onVersionSelect) onVersionSelect(version);
      onClose();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content versions-modal"
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>
            <FiClock /> Version History
          </h3>
          <button onClick={onClose} className="close-btn">
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          <h4 className="file-name-header">{fileName}</h4>

          {loading ? (
            <div className="loading-versions">
              <div className="spinner"></div>
              <p>Loading versions...</p>
            </div>
          ) : versions.length === 0 ? (
            <div className="no-versions">
              <p>No version history available</p>
            </div>
          ) : (
            <div className="versions-list">
              {versions.map((version, index) => (
                <motion.div
                  key={version.id}
                  className={`version-item ${version.isLatestVersion ? 'latest' : ''}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="version-info">
                    <div className="version-badge">v{version.version}</div>
                    <div className="version-details">
                      <span className="version-date">
                        {formatDate(version.uploadedAt)}
                      </span>
                      <span className="version-uploader">
                        <FiUser /> {version.uploadedByName}
                      </span>
                      <span className="version-size">{version.fileSizeDisplay}</span>
                    </div>
                  </div>

                  <div className="version-actions">
                    <button
                      onClick={() => handlePreviewVersion(version.id)}
                      className="version-action-btn"
                      title="Preview"
                    >
                      <FiEye />
                    </button>
                    <button
                      onClick={() => handleDownloadVersion(version.id, version.fileName)}
                      className="version-action-btn"
                      title="Download"
                    >
                      <FiDownload />
                    </button>
                    {!version.isLatestVersion && (
                      <button
                        onClick={() => handleRestoreVersion(version)}
                        className="version-action-btn restore"
                        title="Restore this version"
                      >
                        <FiArrowLeft />
                      </button>
                    )}
                  </div>

                  {version.isLatestVersion && (
                    <span className="latest-badge">Latest</span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FileVersionHistory;