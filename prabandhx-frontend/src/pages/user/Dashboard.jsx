import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiCheckCircle, 
  FiClock,
  FiTrendingUp,
  FiActivity,
  FiCalendar,
  FiArrowRight,
  FiUser,
  FiBriefcase,
  FiAward,
  FiZap,
  FiStar
} from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import { taskService } from '../../services/taskService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import './User.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userPoints, setUserPoints] = useState({
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    todo: 0,
    overdue: 0
  });

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        
        // Ensure user has ID from token if missing
        if (!user.id && token) {
          try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));
            user.id = payload.userId || payload.sub;
            localStorage.setItem('user', JSON.stringify(user));
          } catch (e) {
            console.error('Error decoding token:', e);
          }
        }
        
        setCurrentUser(user);
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchTasks();
      fetchUserPoints();
    }
  }, [currentUser]);

  const fetchUserPoints = async () => {
    try {
      const token = localStorage.getItem('token');
      if (currentUser?.id) {
        const response = await fetch(`http://localhost:8080/api/users/${currentUser.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setUserPoints({
          totalPoints: data.totalPoints || 0,
          currentStreak: data.currentStreak || 0,
          longestStreak: data.longestStreak || 0
        });
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await taskService.getAll();
      const allTasks = response.data?.content || response.data || [];
      
      // Filter tasks assigned to current user
      const myTasks = allTasks.filter(task => {
        // Check by assignedToId (most reliable)
        if (task.assignedToId && currentUser?.id) {
          return task.assignedToId.toString() === currentUser.id.toString();
        }
        
        // Check by assignedToEmail
        if (task.assignedToEmail) {
          return task.assignedToEmail.toLowerCase() === currentUser?.email?.toLowerCase();
        }
        
        // Check by assignedTo object
        if (task.assignedTo?.id) {
          return task.assignedTo.id.toString() === currentUser?.id?.toString();
        }
        
        return false;
      });
      
      setTasks(myTasks);
      
      // Calculate stats
      const completed = myTasks.filter(t => t.status === 'COMPLETED').length;
      const inProgress = myTasks.filter(t => t.status === 'IN_PROGRESS').length;
      const todo = myTasks.filter(t => t.status === 'TODO').length;
      const overdue = myTasks.filter(t => {
        if (t.status === 'COMPLETED' || !t.dueDate) return false;
        return new Date(t.dueDate) < new Date();
      }).length;
      
      setStats({
        total: myTasks.length,
        completed,
        inProgress,
        todo,
        overdue
      });
      
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityClass = (priority) => {
    switch(priority?.toUpperCase()) {
      case 'HIGH': return 'priority-badge high';
      case 'MEDIUM': return 'priority-badge medium';
      case 'LOW': return 'priority-badge low';
      default: return 'priority-badge medium';
    }
  };

  const getStatusClass = (status) => {
    switch(status?.toUpperCase()) {
      case 'COMPLETED': return 'status-badge completed';
      case 'IN_PROGRESS': return 'status-badge in-progress';
      case 'TODO': return 'status-badge todo';
      default: return 'status-badge todo';
    }
  };

  const getDueDateStatus = (dueDate, status) => {
    if (status === 'COMPLETED' || !dueDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(dueDate);
    taskDate.setHours(0, 0, 0, 0);
    
    if (taskDate < today) return 'overdue';
    if (taskDate.getTime() === today.getTime()) return 'today';
    return null;
  };

  const statCards = [
    { 
      title: 'Total Tasks', 
      value: stats.total, 
      icon: '📋', 
      color: '#3b82f6', 
      bg: '#dbeafe',
      trend: stats.total > 0 ? `${((stats.completed/stats.total)*100).toFixed(0)}% complete` : '0% complete'
    },
    { 
      title: 'Completed', 
      value: stats.completed, 
      icon: '✅', 
      color: '#10b981', 
      bg: '#d1fae5',
      trend: stats.total > 0 ? `${((stats.completed/stats.total)*100).toFixed(0)}%` : '0%'
    },
    { 
      title: 'In Progress', 
      value: stats.inProgress, 
      icon: '⚡', 
      color: '#f59e0b', 
      bg: '#fed7aa',
      trend: 'Active tasks'
    },
    { 
      title: 'To Do', 
      value: stats.todo, 
      icon: '📝', 
      color: '#8b5cf6', 
      bg: '#ede9fe',
      trend: 'Pending'
    },
    { 
      title: 'Overdue', 
      value: stats.overdue, 
      icon: '⚠️', 
      color: '#ef4444', 
      bg: '#fee2e2',
      trend: 'Need attention'
    },
    { 
      title: 'Total Points', 
      value: userPoints.totalPoints, 
      icon: '⭐', 
      color: '#f59e0b', 
      bg: '#fef3c7',
      trend: `${userPoints.currentStreak} day streak`
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <Loader />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="user-dashboard">
        {/* Welcome Header */}
        <div className="welcome-header">
          <div className="welcome-text">
            <h1>
              Welcome back, {currentUser?.name || currentUser?.email || 'User'}! 👋
            </h1>
            <p>Here's an overview of your tasks and progress.</p>
          </div>
          <div className="header-actions">
            <button 
              className="refresh-btn"
              onClick={fetchTasks}
            >
              <FiActivity /> Refresh
            </button>
            <button 
              className="leaderboard-btn"
              onClick={() => navigate('/user/leaderboard')}
            >
              <FiAward /> Leaderboard
            </button>
          </div>
        </div>

        {/* Streak Banner - Show if user has streak */}
        {userPoints.currentStreak > 0 && (
          <motion.div 
            className="streak-banner"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="streak-flame">🔥</div>
            <div className="streak-info">
              <h3>{userPoints.currentStreak} Day Streak!</h3>
              <p>Longest streak: {userPoints.longestStreak} days</p>
            </div>
            <div className="streak-progress">
              <div className="progress-text">{userPoints.currentStreak % 5 || 5}/5 to next bonus</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(userPoints.currentStreak % 5) * 20}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="stats-grid">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="stat-icon-wrapper" style={{ background: stat.bg, color: stat.color }}>
                <span className="stat-icon">{stat.icon}</span>
              </div>
              <div className="stat-content">
                <h3 className="stat-title">{stat.title}</h3>
                <div className="stat-main">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-trend">{stat.trend}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Progress Overview */}
        {stats.total > 0 && (
          <motion.div 
            className="progress-overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3>Progress Overview</h3>
            <div className="progress-bars">
              <div className="progress-item">
                <div className="progress-label">
                  <span>Completed</span>
                  <span>{stats.completed}/{stats.total}</span>
                </div>
                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill completed" 
                    style={{ width: `${(stats.completed/stats.total)*100}%` }}
                  ></div>
                </div>
              </div>
              <div className="progress-item">
                <div className="progress-label">
                  <span>In Progress</span>
                  <span>{stats.inProgress}/{stats.total}</span>
                </div>
                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill in-progress" 
                    style={{ width: `${(stats.inProgress/stats.total)*100}%` }}
                  ></div>
                </div>
              </div>
              <div className="progress-item">
                <div className="progress-label">
                  <span>To Do</span>
                  <span>{stats.todo}/{stats.total}</span>
                </div>
                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill todo" 
                    style={{ width: `${(stats.todo/stats.total)*100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recent Tasks Section */}
        <motion.div 
          className="recent-tasks-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="section-header">
            <h3>
              <FiClock /> Recent Tasks
              {tasks.length > 0 && <span className="task-count">{tasks.length} total</span>}
            </h3>
            <button 
              className="view-all-btn"
              onClick={() => navigate('/user/tasks')}
            >
              View All <FiArrowRight />
            </button>
          </div>
          
          {tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h4>No Tasks Assigned</h4>
              <p>You don't have any tasks yet. They will appear here when assigned by your admin.</p>
              <button 
                className="refresh-btn"
                onClick={fetchTasks}
              >
                <FiActivity /> Refresh
              </button>
            </div>
          ) : (
            <div className="tasks-list">
              {tasks.slice(0, 5).map((task) => {
                const dueDateStatus = getDueDateStatus(task.dueDate, task.status);
                
                return (
                  <motion.div 
                    key={task.id} 
                    className={`task-item ${dueDateStatus || ''}`}
                    whileHover={{ x: 5, backgroundColor: '#f8fafc' }}
                    onClick={() => navigate('/user/tasks')}
                  >
                    <div className="task-item-header">
                      <h4>{task.title}</h4>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {task.storyPoints && (
                          <span className="story-points">
                            <FiStar /> {task.storyPoints} pts
                          </span>
                        )}
                        <span className={getStatusClass(task.status)}>
                          {task.status?.replace('_', ' ') || 'TODO'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="task-item-details">
                      <div className="task-detail">
                        <FiBriefcase className="detail-icon" />
                        <span>{task.projectName || 'No Project'}</span>
                      </div>
                      
                      <div className="task-detail">
                        <span className={`priority-dot ${task.priority?.toLowerCase() || 'medium'}`} />
                        <span className={getPriorityClass(task.priority)}>
                          {task.priority || 'MEDIUM'}
                        </span>
                      </div>
                      
                      {task.dueDate && (
                        <div className={`task-detail due-date ${dueDateStatus || ''}`}>
                          <FiCalendar className="detail-icon" />
                          <span>
                            {new Date(task.dueDate).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short'
                            })}
                            {dueDateStatus === 'today' && ' (Today)'}
                            {dueDateStatus === 'overdue' && ' (Overdue)'}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              
              {tasks.length > 5 && (
                <div className="view-more">
                  <button onClick={() => navigate('/user/tasks')}>
                    View {tasks.length - 5} more tasks
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default UserDashboard;