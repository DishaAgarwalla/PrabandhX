import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import ActivityLog from '../../components/activity/ActivityLog';
import { FiBarChart2, FiTrash2 } from 'react-icons/fi';
import { activityLogService } from '../../services/activityLogService';
import toast from 'react-hot-toast';
import './AdminActivityLog.css';

const AdminActivityLog = () => {
  const [cleaning, setCleaning] = useState(false);

  const handleCleanup = async () => {
    const days = window.prompt('Delete logs older than how many days? (default: 30)', '30');
    if (days && !isNaN(days)) {
      setCleaning(true);
      try {
        const response = await activityLogService.cleanupOldLogs(parseInt(days));
        toast.success(`Cleaned up ${response.data?.deletedCount || 0} old log entries`);
      } catch (error) {
        toast.error('Failed to clean up logs');
      } finally {
        setCleaning(false);
      }
    }
  };

  return (
    <Layout>
      <div className="admin-activity-log">
        <div className="page-header">
          <div className="header-left">
            <h1>
              <FiBarChart2 className="header-icon" />
              Activity Log
            </h1>
            <p>Complete audit trail of all system activities</p>
          </div>
          <button 
            className="cleanup-btn"
            onClick={handleCleanup}
            disabled={cleaning}
          >
            <FiTrash2 /> {cleaning ? 'Cleaning...' : 'Clean Old Logs'}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ActivityLog 
            showStats={true}
            showTimeline={true}
            title="System Activity Log"
          />
        </motion.div>
      </div>
    </Layout>
  );
};

export default AdminActivityLog;