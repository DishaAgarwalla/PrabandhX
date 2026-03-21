import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiAward } from 'react-icons/fi'; // Only use existing icons
import Layout from '../../components/layout/Layout';
import Leaderboard from '../../components/leaderboard/Leaderboard';
import './LeaderboardPage.css';

const LeaderboardPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="leaderboard-page">
        {/* Header */}
        <div className="page-header">
          <button 
            className="back-button"
            onClick={() => navigate('/user/dashboard')}
          >
            <FiArrowLeft /> Dashboard
          </button>
          <h1>
            <FiAward className="header-icon" />
            Leaderboard
          </h1>
          <p>See how you rank against other users</p>
        </div>

        {/* Leaderboard Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Leaderboard limit={20} />
        </motion.div>

        {/* Info Cards */}
        <div className="info-cards">
          <motion.div 
            className="info-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3>🏆 How to Earn Points</h3>
            <ul>
              <li>✓ Complete tasks on time: <strong>Full points</strong></li>
              <li>✓ Complete tasks late: <strong>Half points</strong></li>
              <li>✓ Streak bonus: <strong>+25 points every 5 tasks</strong></li>
              <li>✓ Base points: <strong>Story points or 10 default</strong></li>
            </ul>
          </motion.div>

          <motion.div 
            className="info-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3>🔥 Streak Rules</h3>
            <ul>
              <li>✓ Complete tasks on consecutive days</li>
              <li>✓ Miss a day = streak resets</li>
              <li>✓ Multiple tasks same day = counts once</li>
              <li>✓ Late completion = streak resets</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default LeaderboardPage;