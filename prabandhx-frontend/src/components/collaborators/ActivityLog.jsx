import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiUser, FiMail, FiEdit, FiTrash2, FiUserPlus, FiCheck, FiX } from 'react-icons/fi';
import { collaboratorService } from '../../services/collaboratorService';
import toast from 'react-hot-toast';
import './Collaborators.css';

const ActivityLog = ({ projectId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
    
    // Refresh logs every 30 seconds
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, [projectId]);

  const fetchLogs = async () => {
    try {
      const response = await collaboratorService.getActivityLogs(projectId);
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (actionType) => {
    switch(actionType) {
      case 'INVITE':
        return <FiUserPlus className="action-icon invite" />;
      case 'ACCEPT':
        return <FiCheck className="action-icon accept" />;
      case 'UPDATE':
        return <FiEdit className="action-icon update" />;
      case 'REMOVE':
        return <FiTrash2 className="action-icon remove" />;
      case 'EXPIRE':
        return <FiX className="action-icon expire" />;
      default:
        return <FiUser className="action-icon default" />;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.actionType === filter.toUpperCase());

  const actionTypes = ['all', 'invite', 'accept', 'update', 'remove', 'expire'];

  if (loading) {
    return (
      <div className="activity-log-loading">
        <div className="spinner"></div>
        <p>Loading activity log...</p>
      </div>
    );
  }

  return (
    <div className="activity-log-container">
      <div className="activity-log-header">
        <h3>
          <FiClock /> Activity Log
        </h3>
        <div className="activity-filters">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            {actionTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="activity-log-list">
        {filteredLogs.length === 0 ? (
          <div className="empty-logs">
            <FiClock className="empty-icon" />
            <p>No activity logs found</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredLogs.map((log, index) => (
              <motion.div
                key={log.id}
                className={`log-item ${log.actionType.toLowerCase()}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01, x: 5 }}
              >
                <div className="log-icon">
                  {getActionIcon(log.actionType)}
                </div>

                <div className="log-content">
                  <div className="log-message">
                    <strong>{log.userName || log.userEmail}</strong> {log.action}
                    {log.details && (
                      <span className="log-details"> - {log.details}</span>
                    )}
                  </div>
                  <div className="log-time">
                    <FiClock />
                    <span>{formatTime(log.timestamp)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {logs.length > 0 && (
        <div className="activity-log-footer">
          <button onClick={fetchLogs} className="refresh-btn">
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;