import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiMail, FiClock, FiLock, FiUserPlus, FiLoader } from 'react-icons/fi';
import { collaboratorService } from '../../services/collaboratorService';
import toast from 'react-hot-toast';
import './Collaborators.css';

const InviteModal = ({ projectId, projectName, onClose, onInviteSuccess }) => {
  const [email, setEmail] = useState('');
  const [permissionLevel, setPermissionLevel] = useState('VIEWER');
  const [expiryDays, setExpiryDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  const permissionOptions = [
    { value: 'VIEWER', label: 'Viewer', description: 'Can only view project contents', icon: '👁️' },
    { value: 'EDITOR', label: 'Editor', description: 'Can view and edit tasks', icon: '✏️' },
    { value: 'UPLOADER', label: 'Uploader', description: 'Can view and upload files', icon: '📤' },
    { value: 'ADMIN', label: 'Admin', description: 'Full control over project', icon: '⚙️' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDebugInfo('');
    
    // Validate email
    if (!email || !email.trim()) {
      setError('Please enter an email address');
      toast.error('Please enter an email address');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate projectId
    if (!projectId) {
      setError('Project ID is missing');
      toast.error('Project ID is missing');
      return;
    }

    setLoading(true);
    console.log('📤 Sending invitation:', {
      email,
      projectId,
      permissionLevel,
      expiryDays
    });

    try {
      const invitationData = {
        email: email.trim(),
        projectId: parseInt(projectId),
        permissionLevel: permissionLevel,
        expiryDays: expiryDays
      };

      console.log('📦 Invitation data:', invitationData);

      // Try with fetch directly to see raw response
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/collaborations/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(invitationData)
      });

      const responseText = await response.text();
      console.log('📥 Raw response:', response.status, responseText);
      setDebugInfo(`Status: ${response.status}\nResponse: ${responseText}`);

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        data = { message: responseText };
      }

      toast.success(`Invitation sent to ${email}`);
      
      if (onInviteSuccess) {
        onInviteSuccess(data);
      }
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('❌ Invitation error:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
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
        className="modal-content invite-modal"
        initial={{ scale: 0.9, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 50, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '500px' }}
      >
        <div className="modal-header">
          <h3>
            <FiUserPlus /> Invite Collaborator
          </h3>
          <button onClick={onClose} className="close-btn">
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          <div className="project-info">
            <span className="project-label">Project:</span>
            <span className="project-name">{projectName || `Project #${projectId}`}</span>
          </div>

          {error && (
            <div className="error-alert" style={{
              background: '#fee2e2',
              border: '1px solid #ef4444',
              color: '#991b1b',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p><strong>Error:</strong> {error}</p>
            </div>
          )}

          {debugInfo && (
            <div className="debug-info" style={{
              background: '#1e1e2e',
              color: '#fff',
              padding: '10px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '12px',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap'
            }}>
              <strong>Debug Info:</strong>
              <pre>{debugInfo}</pre>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                <FiMail /> Email Address
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="collaborator@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>
                <FiLock /> Permission Level
              </label>
              <div className="permission-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {permissionOptions.map(option => (
                  <div
                    key={option.value}
                    className={`permission-option ${permissionLevel === option.value ? 'selected' : ''}`}
                    onClick={() => !loading && setPermissionLevel(option.value)}
                    style={{
                      padding: '10px',
                      border: '2px solid',
                      borderColor: permissionLevel === option.value ? '#2196f3' : '#e0e0e0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: permissionLevel === option.value ? '#e3f2fd' : 'white'
                    }}
                  >
                    <div style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{option.icon}</div>
                    <div style={{ fontWeight: '600' }}>{option.label}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{option.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>
                <FiClock /> Expires After
              </label>
              <select
                className="form-control"
                value={expiryDays}
                onChange={(e) => setExpiryDays(Number(e.target.value))}
                disabled={loading}
                style={{ width: '100%', padding: '10px' }}
              >
                <option value={1}>1 day</option>
                <option value={3}>3 days</option>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </div>

            <div className="form-actions" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
                disabled={loading}
                style={{ flex: 1, padding: '12px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ flex: 1, padding: '12px' }}
              >
                {loading ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </form>

          <div className="invite-note" style={{
            marginTop: '15px',
            padding: '10px',
            background: '#fff3cd',
            borderRadius: '6px',
            fontSize: '0.85rem',
            color: '#856404'
          }}>
            <p>
              <strong>Note:</strong> The collaborator will receive an email with a link to accept the invitation. 
              The link will expire after {expiryDays} days.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InviteModal;