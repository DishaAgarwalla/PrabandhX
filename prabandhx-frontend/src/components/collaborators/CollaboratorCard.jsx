import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiClock, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import PermissionBadge from './PermissionBadge';
import { collaboratorService } from '../../services/collaboratorService';
import toast from 'react-hot-toast';
import './Collaborators.css';

const CollaboratorCard = ({ collaborator, onUpdate, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(collaborator?.permissionLevel || 'VIEWER');
  const [loading, setLoading] = useState(false);

  // Debug: Log collaborator data on mount and when it changes
  useEffect(() => {
    console.log('👤 CollaboratorCard received:', {
      id: collaborator?.id,
      email: collaborator?.email,
      invitedByName: collaborator?.invitedByName,
      invitedAt: collaborator?.invitedAt,
      isAccepted: collaborator?.isAccepted,
      permissionLevel: collaborator?.permissionLevel,
      isActive: collaborator?.isActive
    });
  }, [collaborator]);

  // Safety check - if no collaborator data, don't render
  if (!collaborator) {
    console.error('❌ CollaboratorCard received null collaborator');
    return null;
  }

  const permissionOptions = ['VIEWER', 'EDITOR', 'UPLOADER', 'ADMIN'];

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const handleUpdatePermission = async () => {
    if (selectedPermission === collaborator.permissionLevel) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      const response = await collaboratorService.updatePermission(
        collaborator.id,
        selectedPermission
      );
      
      toast.success('Permission updated successfully');
      
      if (onUpdate) {
        onUpdate(response.data);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error('Failed to update permission');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm(`Are you sure you want to remove ${collaborator.email} from this project?`)) {
      return;
    }

    setLoading(true);
    try {
      await collaboratorService.removeCollaborator(collaborator.id);
      
      toast.success('Collaborator removed successfully');
      
      if (onRemove) {
        onRemove(collaborator.id);
      }
    } catch (error) {
      console.error('Error removing collaborator:', error);
      toast.error('Failed to remove collaborator');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!collaborator.isAccepted) {
      return <span className="status-badge pending">Pending</span>;
    }
    if (collaborator.isExpired) {
      return <span className="status-badge expired">Expired</span>;
    }
    return <span className="status-badge active">Active</span>;
  };

  // Get display name with fallback
  const getInvitedByName = () => {
    return collaborator.invitedByName || 'Unknown';
  };

  // Get email with fallback
  const getEmail = () => {
    return collaborator.email || 'No email provided';
  };

  // Get avatar initial
  const getAvatarInitial = () => {
    const name = getInvitedByName();
    if (name !== 'Unknown' && name) {
      return name.charAt(0).toUpperCase();
    }
    return null;
  };

  return (
    <motion.div
      className="collaborator-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02, boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
    >
      <div className="collaborator-avatar">
        {getAvatarInitial() ? (
          <div className="avatar-initials">
            {getAvatarInitial()}
          </div>
        ) : (
          <FiUser />
        )}
      </div>

      <div className="collaborator-info">
        <div className="collaborator-header">
          <div className="collaborator-email">
            <FiMail className="icon" />
            <span title={getEmail()}>{getEmail()}</span>
          </div>
          {getStatusBadge()}
        </div>

        <div className="collaborator-details">
          <div className="detail-item">
            <FiUser className="icon" />
            <span>Invited by: {getInvitedByName()}</span>
          </div>
          <div className="detail-item">
            <FiClock className="icon" />
            <span>Invited: {formatDate(collaborator.invitedAt)}</span>
          </div>
          {collaborator.expiresAt && (
            <div className="detail-item">
              <FiClock className="icon" />
              <span>Expires: {formatDate(collaborator.expiresAt)}</span>
            </div>
          )}
        </div>

        <div className="collaborator-permission">
          {isEditing ? (
            <div className="permission-edit">
              <select
                value={selectedPermission}
                onChange={(e) => setSelectedPermission(e.target.value)}
                disabled={loading}
                className="permission-select"
              >
                {permissionOptions.map(perm => (
                  <option key={perm} value={perm}>{perm}</option>
                ))}
              </select>
              <button
                onClick={handleUpdatePermission}
                disabled={loading}
                className="icon-btn save"
                title="Save"
              >
                <FiCheck />
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedPermission(collaborator.permissionLevel);
                }}
                disabled={loading}
                className="icon-btn cancel"
                title="Cancel"
              >
                <FiX />
              </button>
            </div>
          ) : (
            <div className="permission-display">
              <PermissionBadge permission={collaborator.permissionLevel || 'VIEWER'} />
              {collaborator.isAccepted && !collaborator.isExpired && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="icon-btn edit"
                  title="Edit Permission"
                >
                  <FiEdit2 />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleRemove}
        disabled={loading}
        className="remove-btn"
        title="Remove Collaborator"
      >
        <FiTrash2 />
      </button>
    </motion.div>
  );
};

export default CollaboratorCard;