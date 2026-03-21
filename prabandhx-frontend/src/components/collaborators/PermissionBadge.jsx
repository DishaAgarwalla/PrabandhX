import React from 'react';
import './Collaborators.css';

const PermissionBadge = ({ permission, size = 'medium' }) => {
  const getPermissionDetails = (perm) => {
    switch(perm) {
      case 'VIEWER':
        return {
          label: 'Viewer',
          icon: '👁️',
          color: '#2196f3',
          background: '#e3f2fd'
        };
      case 'EDITOR':
        return {
          label: 'Editor',
          icon: '✏️',
          color: '#4caf50',
          background: '#e8f5e9'
        };
      case 'UPLOADER':
        return {
          label: 'Uploader',
          icon: '📤',
          color: '#ff9800',
          background: '#fff3e0'
        };
      case 'ADMIN':
        return {
          label: 'Admin',
          icon: '⚙️',
          color: '#f44336',
          background: '#ffebee'
        };
      default:
        return {
          label: perm || 'Unknown',
          icon: '❓',
          color: '#9e9e9e',
          background: '#f5f5f5'
        };
    }
  };

  const details = getPermissionDetails(permission);

  return (
    <span
      className={`permission-badge ${size}`}
      style={{
        backgroundColor: details.background,
        color: details.color,
        borderColor: details.color
      }}
    >
      <span className="permission-icon">{details.icon}</span>
      <span className="permission-label">{details.label}</span>
    </span>
  );
};

export default PermissionBadge;