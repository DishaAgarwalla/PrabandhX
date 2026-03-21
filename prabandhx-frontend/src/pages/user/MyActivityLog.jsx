import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import ActivityLog from '../../components/activity/ActivityLog';
import { FiUser } from 'react-icons/fi';
import './MyActivityLog.css';

const MyActivityLog = () => {
  // Get current user from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  return (
    <Layout>
      <div className="my-activity-log">
        <div className="page-header">
          <h1>
            <FiUser className="header-icon" />
            My Activity
          </h1>
          <p>Track your personal activity across the platform</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ActivityLog 
            userId={user?.id}
            showStats={true}
            showTimeline={false}
            title="Your Recent Activity"
          />
        </motion.div>
      </div>
    </Layout>
  );
};

export default MyActivityLog;