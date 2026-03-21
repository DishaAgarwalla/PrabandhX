import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiAward, 
  FiTrendingUp, 
  FiStar, 
  FiZap,
  FiUser,
  FiRefreshCw
} from 'react-icons/fi';  // Removed FiCrown - it doesn't exist
import './Leaderboard.css';

const Leaderboard = ({ limit = 10 }) => {
  const [activeTab, setActiveTab] = useState('points');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      
      const endpoint = activeTab === 'points' 
        ? `http://localhost:8080/api/leaderboard/points?limit=${limit}`
        : `http://localhost:8080/api/leaderboard/streaks?limit=${limit}`;
      
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setLeaderboard(data);
      
      // Get current user rank if needed
      if (currentUser?.id) {
        fetchUserRank(currentUser.id);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRank = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/leaderboard/rank/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCurrentUserRank(data);
    } catch (error) {
      console.error('Error fetching user rank:', error);
    }
  };

  const getMedalEmoji = (index) => {
    switch(index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return null;
    }
  };

  const getMedalColor = (index) => {
    switch(index) {
      case 0: return '#FFD700'; // Gold
      case 1: return '#C0C0C0'; // Silver
      case 2: return '#CD7F32'; // Bronze
      default: return '#94a3b8';
    }
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const getRandomColor = (email) => {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#ec4899', '#14b8a6', '#f97316', '#6b7280', '#6366f1'
    ];
    const index = email ? email.length % colors.length : 0;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="leaderboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h2>
          <FiAward className="header-icon" />
          Leaderboard
        </h2>
        <div className="leaderboard-tabs">
          <button
            className={`tab-btn ${activeTab === 'points' ? 'active' : ''}`}
            onClick={() => setActiveTab('points')}
          >
            <FiTrendingUp /> Top by Points
          </button>
          <button
            className={`tab-btn ${activeTab === 'streaks' ? 'active' : ''}`}
            onClick={() => setActiveTab('streaks')}
          >
            <FiZap /> Top Streaks
          </button>
        </div>
        <button className="refresh-btn" onClick={fetchLeaderboard}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {currentUserRank && (
        <div className="user-rank-card">
          <div className="rank-info">
            <span className="rank-label">Your Rank (Points)</span>
            <span className="rank-value">#{currentUserRank.pointsRank}</span>
          </div>
          <div className="rank-info">
            <span className="rank-label">Your Rank (Streak)</span>
            <span className="rank-value">#{currentUserRank.streakRank}</span>
          </div>
        </div>
      )}

      <div className="leaderboard-list">
        {leaderboard.length === 0 ? (
          <div className="empty-leaderboard">
            <FiAward className="empty-icon" />
            <h3>No data yet</h3>
            <p>Complete tasks to appear on the leaderboard!</p>
          </div>
        ) : (
          leaderboard.map((user, index) => (
            <motion.div
              key={user.id}
              className={`leaderboard-item ${index < 3 ? 'top-three' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: 10 }}
            >
              <div className="rank-badge" style={{ background: getMedalColor(index) }}>
                {index < 3 ? getMedalEmoji(index) : `#${index + 1}`}
              </div>
              
              <div 
                className="user-avatar"
                style={{ background: getRandomColor(user.email) }}
              >
                {getInitials(user.name)}
              </div>
              
              <div className="user-info">
                <h4>{user.name}</h4>
                <p>{user.email}</p>
              </div>
              
              <div className="user-stats">
                {activeTab === 'points' ? (
                  <div className="stat">
                    <FiStar className="stat-icon" />
                    <span className="stat-value">{user.totalPoints || 0}</span>
                    <span className="stat-label">points</span>
                  </div>
                ) : (
                  <div className="stat">
                    <FiZap className="stat-icon" />
                    <span className="stat-value">{user.currentStreak || 0}</span>
                    <span className="stat-label">day streak</span>
                    {user.longestStreak > 0 && (
                      <span className="streak-record">(best: {user.longestStreak})</span>
                    )}
                  </div>
                )}
              </div>

              {index === 0 && (
                <div className="crown">
                  👑 {/* Using emoji instead of icon */}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Leaderboard;