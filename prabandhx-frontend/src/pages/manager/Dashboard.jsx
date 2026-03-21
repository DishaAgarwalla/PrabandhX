import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { projectService } from '../../services/projectService';
import { taskService } from '../../services/taskService';
import { userService } from '../../services/userService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import { 
  FiFolder, 
  FiCheckCircle, 
  FiUsers, 
  FiClock, 
  FiTrendingUp,
  FiAlertCircle,
  FiCalendar,
  FiArrowRight,
  FiBarChart2,
  FiUserCheck,
  FiTarget,
  FiActivity
} from 'react-icons/fi';
import './Manager.css';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    teamMembers: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    activeProjects: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [activityData, setActivityData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    console.log('📊 Fetching manager dashboard data...');
    try {
      // Fetch all data in parallel with error handling
      const [projectsRes, tasksRes, usersRes] = await Promise.all([
        projectService.getAll().catch(err => {
          console.warn('Projects fetch failed:', err);
          return { data: { content: [] } };
        }),
        taskService.getAll().catch(err => {
          console.warn('Tasks fetch failed:', err);
          return { data: { content: [] } };
        }),
        userService.getAll().catch(err => {
          console.warn('Users fetch failed:', err);
          return { data: [] };
        })
      ]);

      // Extract data from responses
      const projects = projectsRes.data?.content || projectsRes.data || [];
      const tasks = tasksRes.data?.content || tasksRes.data || [];
      const users = usersRes.data || [];

      // Filter for regular users (team members)
      const teamMembers = users.filter(user => {
        const role = user.role?.replace('ROLE_', '') || user.role;
        return role === 'USER';
      });

      // Calculate stats
      const pendingTasksCount = tasks.filter(task => 
        task.status !== 'COMPLETED' && task.status !== 'Completed'
      ).length;

      const overdueTasksCount = tasks.filter(task => {
        if (task.status === 'COMPLETED' || task.status === 'Completed') return false;
        if (!task.dueDate) return false;
        return new Date(task.dueDate) < new Date();
      }).length;

      const activeProjectsCount = projects.filter(p => 
        p.status === 'ACTIVE' || p.status === 'Active'
      ).length;

      // Get recent projects (last 3)
      const recent = projects.slice(0, 3);
      
      // Get pending tasks (not completed)
      const pending = tasks.filter(task => 
        task.status !== 'COMPLETED' && task.status !== 'Completed'
      ).slice(0, 5);

      // Generate activity data for chart
      generateActivityData(tasks);

      setStats({
        totalProjects: projects.length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => 
          t.status === 'COMPLETED' || t.status === 'Completed'
        ).length,
        teamMembers: teamMembers.length,
        pendingTasks: pendingTasksCount,
        overdueTasks: overdueTasksCount,
        activeProjects: activeProjectsCount
      });
      
      setRecentProjects(recent);
      setPendingTasks(pending);
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateActivityData = (tasks) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    
    const data = days.map((day, index) => {
      const dayTasks = tasks.filter(task => {
        if (!task.createdAt) return false;
        const taskDate = new Date(task.createdAt);
        const dayDiff = Math.floor((today - taskDate) / (1000 * 60 * 60 * 24));
        return dayDiff === index;
      }).length;
      
      return {
        name: day,
        tasks: dayTasks,
        projects: Math.floor(Math.random() * 3) // Placeholder - replace with actual data
      };
    });
    
    setActivityData(data);
  };

  const getTaskPriorityColor = (priority) => {
    switch(priority?.toUpperCase()) {
      case 'HIGH': return '#ef4444';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#10b981';
      default: return '#64748b';
    }
  };

  const statCards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: FiFolder,
      color: '#3b82f6',
      bg: '#dbeafe',
      trend: `${stats.activeProjects} active`,
      link: '/manager/projects'
    },
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: FiTarget,
      color: '#8b5cf6',
      bg: '#ede9fe',
      trend: `${stats.completedTasks} completed`,
      link: '/manager/tasks'
    },
    {
      title: 'Team Members',
      value: stats.teamMembers,
      icon: FiUsers,
      color: '#10b981',
      bg: '#d1fae5',
      trend: 'Active team',
      link: '/manager/team'
    },
    {
      title: 'Pending Tasks',
      value: stats.pendingTasks,
      icon: FiClock,
      color: '#f59e0b',
      bg: '#fed7aa',
      trend: `${stats.overdueTasks} overdue`,
      link: '/manager/tasks?status=pending'
    },
    {
      title: 'Completed',
      value: stats.completedTasks,
      icon: FiCheckCircle,
      color: '#10b981',
      bg: '#d1fae5',
      trend: `${((stats.completedTasks/stats.totalTasks || 0) * 100).toFixed(0)}% done`,
      link: '/manager/tasks?status=completed'
    },
    {
      title: 'Overdue',
      value: stats.overdueTasks,
      icon: FiAlertCircle,
      color: '#ef4444',
      bg: '#fee2e2',
      trend: 'Need attention',
      link: '/manager/tasks?status=overdue'
    }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

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
      <div className="manager-dashboard">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-left">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Manager Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Welcome back! Here's an overview of your projects and team.
            </motion.p>
          </div>
          <div className="header-right">
            <div className="date-badge">
              <FiCalendar />
              <span>{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => stat.link && navigate(stat.link)}
              style={{ cursor: stat.link ? 'pointer' : 'default' }}
            >
              <div className="stat-icon-wrapper" style={{ background: stat.bg }}>
                <stat.icon style={{ color: stat.color }} />
              </div>
              <div className="stat-content">
                <h3>{stat.title}</h3>
                <div className="stat-main">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-trend">{stat.trend}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts and Activity Section */}
        <div className="charts-section">
          {/* Activity Overview */}
          <motion.div 
            className="chart-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="chart-header">
              <h3>
                <FiActivity className="chart-icon" />
                Activity Overview
              </h3>
              <div className="chart-controls">
                <button 
                  className={`time-btn ${timeRange === 'week' ? 'active' : ''}`}
                  onClick={() => setTimeRange('week')}
                >
                  Week
                </button>
                <button 
                  className={`time-btn ${timeRange === 'month' ? 'active' : ''}`}
                  onClick={() => setTimeRange('month')}
                >
                  Month
                </button>
              </div>
            </div>
            <div className="chart-container">
              {/* Simple bar chart representation */}
              <div className="simple-chart">
                {activityData.map((day, index) => (
                  <div key={index} className="chart-bar-group">
                    <div className="chart-bars">
                      <div 
                        className="bar tasks-bar" 
                        style={{ height: `${day.tasks * 20}px` }}
                        title={`${day.tasks} tasks`}
                      />
                      <div 
                        className="bar projects-bar" 
                        style={{ height: `${day.projects * 20}px` }}
                        title={`${day.projects} projects`}
                      />
                    </div>
                    <span className="bar-label">{day.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            className="quick-stats-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h3>Quick Stats</h3>
            <div className="quick-stats-list">
              <div className="quick-stat-item">
                <span className="stat-label">Completion Rate</span>
                <div className="stat-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${((stats.completedTasks/stats.totalTasks || 0) * 100).toFixed(0)}%` }}
                    />
                  </div>
                  <span className="progress-value">
                    {((stats.completedTasks/stats.totalTasks || 0) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="quick-stat-item">
                <span className="stat-label">Active Projects</span>
                <span className="stat-number">{stats.activeProjects}</span>
              </div>
              <div className="quick-stat-item">
                <span className="stat-label">Team Efficiency</span>
                <span className="stat-number good">85%</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Projects and Pending Tasks */}
        <div className="content-grid">
          {/* Recent Projects */}
          <motion.div 
            className="content-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="card-header">
              <h3>
                <FiFolder className="header-icon" />
                Recent Projects
              </h3>
              <button 
                className="view-all-btn"
                onClick={() => navigate('/manager/projects')}
              >
                View All <FiArrowRight />
              </button>
            </div>
            
            {recentProjects.length === 0 ? (
              <div className="empty-state">
                <p>No recent projects</p>
              </div>
            ) : (
              <div className="projects-list">
                {recentProjects.map((project, index) => (
                  <motion.div 
                    key={project.id} 
                    className="project-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + (index * 0.1) }}
                    whileHover={{ x: 10 }}
                    onClick={() => navigate(`/manager/projects/${project.id}`)}
                  >
                    <div className="project-icon">
                      <FiFolder />
                    </div>
                    <div className="project-info">
                      <h4>{project.name}</h4>
                      <p>{project.description || 'No description'}</p>
                    </div>
                    <span className={`project-status ${project.status?.toLowerCase()}`}>
                      {project.status || 'ACTIVE'}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Pending Tasks */}
          <motion.div 
            className="content-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="card-header">
              <h3>
                <FiClock className="header-icon" />
                Pending Tasks
              </h3>
              <button 
                className="view-all-btn"
                onClick={() => navigate('/manager/tasks')}
              >
                View All <FiArrowRight />
              </button>
            </div>
            
            {pendingTasks.length === 0 ? (
              <div className="empty-state">
                <p>No pending tasks</p>
              </div>
            ) : (
              <div className="tasks-list">
                {pendingTasks.map((task, index) => {
                  const dueDateStatus = task.dueDate && new Date(task.dueDate) < new Date() ? 'overdue' : '';
                  return (
                    <motion.div 
                      key={task.id} 
                      className={`task-item ${dueDateStatus}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 + (index * 0.1) }}
                      whileHover={{ x: 10 }}
                      onClick={() => navigate('/manager/tasks')}
                    >
                      <div className="task-priority">
                        <span 
                          className="priority-dot" 
                          style={{ background: getTaskPriorityColor(task.priority) }}
                        />
                      </div>
                      <div className="task-info">
                        <h4>{task.title}</h4>
                        <p className="task-project">{task.projectName || task.project?.name || 'No project'}</p>
                      </div>
                      <div className="task-meta">
                        {task.dueDate && (
                          <span className={`due-date ${dueDateStatus}`}>
                            <FiCalendar /> {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Team Overview */}
        <motion.div 
          className="team-overview"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <div className="overview-header">
            <h3>
              <FiUsers className="header-icon" />
              Team Overview
            </h3>
            <button 
              className="view-all-btn"
              onClick={() => navigate('/manager/team')}
            >
              Manage Team <FiArrowRight />
            </button>
          </div>
          <div className="team-stats">
            <div className="team-stat">
              <span className="stat-label">Total Members</span>
              <span className="stat-number">{stats.teamMembers}</span>
            </div>
            <div className="team-stat">
              <span className="stat-label">Tasks per Member</span>
              <span className="stat-number">
                {stats.teamMembers ? (stats.totalTasks / stats.teamMembers).toFixed(1) : 0}
              </span>
            </div>
            <div className="team-stat">
              <span className="stat-label">Active Now</span>
              <span className="stat-number good">3</span>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ManagerDashboard;