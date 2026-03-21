import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCopy, FiLink2, FiClock, FiLock } from 'react-icons/fi';
import { fileService } from '../../services/fileService';
import toast from 'react-hot-toast';
import './Files.css';

const FileShareModal = ({ file, onClose, onShare }) => {
  const [expiryDays, setExpiryDays] = useState(7);
  const [permissions, setPermissions] = useState('VIEW_ONLY');
  const [generating, setGenerating] = useState(false);
  const [shareLink, setShareLink] = useState('');

  if (!file) return null;

  const handleGenerateLink = async () => {
    setGenerating(true);
    try {
      console.log('Generating link for file:', file.id);
      const response = await fileService.generateShareLink(file.id, expiryDays, permissions);
      console.log('Share link response:', response);
      
      if (response.data && response.data.shareableLink) {
        const fullLink = `${window.location.origin}/shared/${response.data.shareableLink}`;
        setShareLink(fullLink);
        toast.success('Share link generated successfully');
        if (onShare) onShare(response.data);
      } else {
        toast.error('Invalid response from server');
      }
    } catch (error) {
      console.error('Share link error:', error);
      toast.error('Failed to generate share link');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success('Link copied to clipboard');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><FiLink2 /> Share File</h3>
          <button onClick={onClose} className="close-btn"><FiX /></button>
        </div>

        <div className="modal-body">
          <div className="file-info">
            <h4>{file.fileName}</h4>
            <p>{file.fileSizeDisplay}</p>
          </div>

          {!shareLink ? (
            <>
              <div className="form-group">
                <label><FiClock /> Expires after</label>
                <select value={expiryDays} onChange={(e) => setExpiryDays(Number(e.target.value))}>
                  <option value={1}>1 day</option>
                  <option value={3}>3 days</option>
                  <option value={7}>7 days</option>
                  <option value={30}>30 days</option>
                </select>
              </div>

              <div className="form-group">
                <label><FiLock /> Permissions</label>
                <select value={permissions} onChange={(e) => setPermissions(e.target.value)}>
                  <option value="VIEW_ONLY">View Only</option>
                  <option value="DOWNLOAD">Can Download</option>
                  <option value="EDIT">Can Edit</option>
                </select>
              </div>

              <button 
                onClick={handleGenerateLink} 
                disabled={generating}
                className="btn-primary"
              >
                {generating ? 'Generating...' : 'Generate Share Link'}
              </button>
            </>
          ) : (
            <div className="share-result">
              <div className="link-box">
                <input type="text" value={shareLink} readOnly />
                <button onClick={handleCopyLink} className="copy-btn">
                  <FiCopy />
                </button>
              </div>
              <p className="expiry-note">
                <FiClock /> Expires: {new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileShareModal;