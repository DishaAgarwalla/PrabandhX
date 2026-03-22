import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiUser, 
  FiClock, 
  FiFolder, 
  FiFile, 
  FiCheckCircle,
  FiEdit2,
  FiTrash2,
  FiUpload,
  FiDownload,
  FiLogIn,
  FiLogOut,
  FiUserPlus,
  FiUserCheck,
  FiMail,
  FiStar,
  FiGlobe
} from 'react-icons/fi';

const ActivityItem = ({ log, index }) => {
  const getIcon = () => {
    const type = log.actionType?.toUpperCase() || '';
    const action = log.action?.toUpperCase() || '';
    
    if (type.includes('CREATE') || action.includes('CREATE')) return <FiCheckCircle />;
    if (type.includes('UPDATE') || action.includes('UPDATE')) return <FiEdit2 />;
    if (type.includes('DELETE') || action.includes('DELETE')) return <FiTrash2 />;
    if (type.includes('UPLOAD') || action.includes('UPLOAD')) return <FiUpload />;
    if (type.includes('DOWNLOAD') || action.includes('DOWNLOAD')) return <FiDownload />;
    if (type.includes('LOGIN') || action.includes('LOGIN')) return <FiLogIn />;
    if (type.includes('LOGOUT') || action.includes('LOGOUT')) return <FiLogOut />;
    if (type.includes('INVITE') || action.includes('INVITE')) return <FiUserPlus />;
    if (type.includes('ACCEPT') || action.includes('ACCEPT')) return <FiUserCheck />;
    return <FiUser />;
  };

  const getIconColor = () => {
    const type = log.actionType?.toUpperCase() || '';
    const action = log.action?.toUpperCase() || '';
    
    if (type.includes('CREATE') || action.includes('CREATE')) return '#10b981';
    if (type.includes('UPDATE') || action.includes('UPDATE')) return '#3b82f6';
    if (type.includes('DELETE') || action.includes('DELETE')) return '#ef4444';
    if (type.includes('UPLOAD') || action.includes('UPLOAD')) return '#8b5cf6';
    if (type.includes('DOWNLOAD') || action.includes('DOWNLOAD')) return '#f59e0b';
    if (type.includes('LOGIN') || action.includes('LOGIN')) return '#06b6d4';
    if (type.includes('INVITE') || action.includes('INVITE')) return '#ec489a';
    if (type.includes('ACCEPT') || action.includes('ACCEPT')) return '#14b8a6';
    return '#64748b';
  };

  const getTypeClass = () => {
    const type = log.actionType?.toLowerCase() || '';
    const action = log.action?.toLowerCase() || '';
    
    if (type.includes('create') || action.includes('create')) return 'create';
    if (type.includes('update') || action.includes('update')) return 'update';
    if (type.includes('delete') || action.includes('delete')) return 'delete';
    if (type.includes('upload') || action.includes('upload')) return 'upload';
    if (type.includes('download') || action.includes('download')) return 'download';
    if (type.includes('login') || action.includes('login')) return 'login';
    if (type.includes('invite') || action.includes('invite')) return 'invite';
    if (type.includes('accept') || action.includes('accept')) return 'accept';
    return '';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserRoleBadge = (role) => {
    if (!role) return null;
    const roleColors = {
      ADMIN: { bg: '#fef3c7', color: '#d97706', label: 'Admin' },
      MANAGER: { bg: '#dbeafe', color: '#2563eb', label: 'Manager' },
      USER: { bg: '#e0e7ff', color: '#4338ca', label: 'User' }
    };
    const config = roleColors[role.toUpperCase()] || roleColors.USER;
    return (
      <span className="user-badge" style={{ background: config.bg, color: config.color }}>
        {config.label}
      </span>
    );
  };

  return (
    <motion.div
      className={`activity-item ${getTypeClass()}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ x: 4 }}
    >
      <div className="activity-icon" style={{ color: getIconColor() }}>
        {getIcon()}
      </div>

      <div className="activity-content">
        <div className="activity-user">
          {log.userName || log.userEmail || 'System'}
          {getUserRoleBadge(log.userRole)}
        </div>
        
        <div className="activity-action">
          {log.action}
        </div>
        
        {log.details && (
          <div className="activity-details">
            {log.details}
          </div>
        )}

        <div className="activity-meta">
          <span className="activity-time">
            <FiClock /> {formatTime(log.timestamp)}
          </span>
          
          {log.projectName && (
            <span className="activity-project">
              <FiFolder /> {log.projectName}
            </span>
          )}
          
          {log.entityName && (
            <span className="activity-entity">
              <FiFile /> {log.entityName}
            </span>
          )}
          
          {log.ipAddress && log.ipAddress !== 'unknown' && (
            <span className="activity-ip">
              <FiGlobe /> IP: {log.ipAddress}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityItem;
