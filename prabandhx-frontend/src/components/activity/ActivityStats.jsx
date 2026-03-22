import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiActivity, 
  FiTrendingUp, 
  FiUsers, 
  FiFile, 
  FiCheckCircle,
  FiClock,
  FiZap,
  FiCalendar
} from 'react-icons/fi';

const ActivityStats = ({ stats }) => {
  if (!stats) return null;

  const statCards = [
    {
      title: 'Today\'s Activity',
      value: stats.today || stats.todayCount || 0,
      icon: FiClock,
      color: '#3b82f6',
      bg: '#eff6ff'
    },
    {
      title: 'Total Actions',
      value: stats.total || stats.totalCount || 0,
      icon: FiActivity,
      color: '#10b981',
      bg: '#ecfdf5'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers || stats.uniqueUsers || 0,
      icon: FiUsers,
      color: '#8b5cf6',
      bg: '#f3e8ff'
    },
    {
      title: 'This Week',
      value: stats.thisWeek || 0,
      icon: FiCalendar,
      color: '#f59e0b',
      bg: '#fef3c7'
    }
  ];

  // Get top action types
  const topActions = stats.byType ? Object.entries(stats.byType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5) : [];

  const getActionLabel = (type) => {
    const labels = {
      CREATE_TASK: 'Tasks Created',
      UPDATE_TASK: 'Tasks Updated',
      DELETE_TASK: 'Tasks Deleted',
      UPLOAD_FILE: 'Files Uploaded',
      DOWNLOAD_FILE: 'Files Downloaded',
      LOGIN: 'User Logins',
      INVITE_COLLABORATOR: 'Invitations Sent',
      ACCEPT_INVITE: 'Invitations Accepted'
    };
    return labels[type] || type.replace(/_/g, ' ');
  };

  return (
    <div className="activity-stats-container">
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="stat-icon" style={{ background: stat.bg, color: stat.color }}>
              <stat.icon />
            </div>
            <div className="stat-content">
              <span className="stat-label" style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                {stat.title}
              </span>
              <span className="stat-value" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>
                {stat.value}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {topActions.length > 0 && (
        <div className="top-actions">
          <h4>
            <FiZap /> Top Actions This Month
          </h4>
          <div className="actions-list">
            {topActions.map(([type, count], index) => (
              <div key={type} className="action-item">
                <span className="action-name">{getActionLabel(type)}</span>
                <div className="action-bar">
                  <div 
                    className="action-bar-fill"
                    style={{ width: `${(count / topActions[0][1]) * 100}%` }}
                  />
                </div>
                <span className="action-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityStats;
