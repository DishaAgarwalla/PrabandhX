import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, 
  FiFolder, 
  FiCheckCircle, 
  FiTrendingUp,
  FiActivity,
  FiUserPlus,
  FiPlusCircle,
  FiCheckSquare,
  FiMoreVertical
} from 'react-icons/fi';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Layout from '../../components/layout/Layout';
import { projectService } from '../../services/projectService';
import { userService } from '../../services/userService';
import { taskService } from '../../services/taskService';
import { activityLogService } from '../../services/activityLogService'; // ✅ ADD THIS IMPORT
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import './Admin.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    activeProjects: 0,
    inProgressTasks: 0,
    todoTasks: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [taskDistribution, setTaskDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  
  // Data states
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  // Form states
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    organizationId: 1
  });

  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    status: 'ACTIVE'
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedTo: '',
    assignedToEmail: '',
    assignedToName: '',
    priority: 'MEDIUM',
    status: 'TODO',
    dueDate: ''
  });

  useEffect(() => {
    fetchDashboardData();
    fetchProjects();
    fetchUsers();
    fetchActivityStats(); // ✅ ADD THIS - Fetch real activity data
  }, [timeRange]);

  // ✅ NEW: Fetch real activity stats from API
  const fetchActivityStats = async () => {
    try {
      const response = await activityLogService.getActivityStats();
      console.log('📊 Activity Stats Response:', response.data);
      
      if (response.data && response.data.timeline) {
        const timeline = response.data.timeline;
        
        // Get last 7 days of data (or all available)
        const last7Days = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          
          // Find if there's data for this date
          const found = timeline.find(item => {
            const itemDate = new Date(item[0]);
            itemDate.setHours(0, 0, 0, 0);
            return itemDate.getTime() === date.getTime();
          });
          
          last7Days.push({
            date: date,
            count: found ? found[1] : 0,
            name: formatDateLabel(date)
          });
        }
        
        const formattedWeeklyData = last7Days.map(item => ({
          name: item.name,
          tasks: item.count,
          projects: 0 // We don't have separate project activity data
        }));
        
        setWeeklyActivity(formattedWeeklyData);
      } else {
        // Fallback to mock data if API returns empty
        generateMockWeeklyActivity();
      }
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      generateMockWeeklyActivity();
    }
  };

  // ✅ Format date label (Today, Yesterday, or actual date)
  const formatDateLabel = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    
    if (compareDate.getTime() === todayDate.getTime()) {
      return 'Today';
    } else if (compareDate.getTime() === yesterdayDate.getTime()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short' 
    });
  };

  // ✅ Fallback mock data if API fails
  const generateMockWeeklyActivity = () => {
    const days = ['Today', 'Yesterday', 'Mar 19', 'Mar 18', 'Mar 17', 'Mar 16', 'Mar 15'];
    const mockData = days.map(day => ({
      name: day,
      tasks: Math.floor(Math.random() * 15),
      projects: Math.floor(Math.random() * 5)
    }));
    setWeeklyActivity(mockData);
  };

  const fetchDashboardData = async () => {
    console.log('📊 Fetching admin dashboard data...');
    try {
      const [usersRes, projectsRes, tasksRes] = await Promise.all([
        userService.getAll(),
        projectService.getAll(),
        taskService.getAll()
      ]);

      const users = usersRes.data || [];
      const projects = projectsRes.data?.content || projectsRes.data || [];
      const tasks = tasksRes.data?.content || tasksRes.data || [];

      const completedTasks = tasks.filter(t => t?.status === 'COMPLETED').length;
      const inProgressTasks = tasks.filter(t => t?.status === 'IN_PROGRESS').length;
      const todoTasks = tasks.filter(t => t?.status === 'TODO').length;
      const pendingTasks = inProgressTasks + todoTasks;
      const activeProjects = projects.filter(p => p?.status === 'ACTIVE').length;

      setStats({
        totalUsers: users.length,
        totalProjects: projects.length,
        totalTasks: tasks.length,
        completedTasks,
        pendingTasks,
        activeProjects,
        inProgressTasks,
        todoTasks
      });

      // Task distribution
      setTaskDistribution([
        { name: 'Completed', value: completedTasks, color: '#10b981' },
        { name: 'In Progress', value: inProgressTasks, color: '#f59e0b' },
        { name: 'To Do', value: todoTasks, color: '#ef4444' }
      ]);

      // Generate recent activities
      generateRecentActivities(users, projects, tasks);

    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateRecentActivities = (users, projects, tasks) => {
    const activities = [];
    
    users.slice(-3).forEach(user => {
      activities.push({
        id: `user-${user.id}`,
        user: user.name,
        action: 'joined the platform',
        target: '',
        time: new Date(user.createdAt || Date.now()).toLocaleDateString(),
        avatar: user.name?.charAt(0) || 'U',
        color: '#10b981'
      });
    });

    projects.slice(-3).forEach(project => {
      activities.push({
        id: `project-${project.id}`,
        user: 'System',
        action: 'created project',
        target: project.name,
        time: new Date(project.createdAt || Date.now()).toLocaleDateString(),
        avatar: '📁',
        color: '#3b82f6'
      });
    });

    tasks.slice(-3).forEach(task => {
      activities.push({
        id: `task-${task.id}`,
        user: 'System',
        action: 'added task',
        target: task.title,
        time: new Date(task.createdAt || Date.now()).toLocaleDateString(),
        avatar: '✅',
        color: '#f59e0b'
      });
    });

    const sorted = activities.sort((a, b) => 
      new Date(b.time) - new Date(a.time)
    ).slice(0, 5);
    
    setRecentActivities(sorted);
  };

  const fetchProjects = async () => {
    try {
      const response = await projectService.getAll();
      const projectsData = response.data?.content || response.data || [];
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll();
      setUsers(response.data || []);
      console.log('👥 Available users:', response.data.map(u => ({ 
        id: u.id, 
        name: u.name, 
        email: u.email 
      })));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Handle Add User button click
  const handleAddUserClick = () => {
    console.log('➕ Opening Add User modal');
    setShowUserModal(true);
  };

  // Handle New Project button click
  const handleNewProjectClick = () => {
    console.log('📁 Opening New Project modal');
    setShowProjectModal(true);
  };

  // Handle Create Task button click
  const handleCreateTaskClick = () => {
    console.log('✅ Opening Create Task modal');
    console.log('📋 Available users for assignment:', users.map(u => u.email));
    setShowTaskModal(true);
  };

  // Handle User Creation
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      console.log('Creating user:', userForm);
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      
      if (response.ok) {
        toast.success('User created successfully');
        setShowUserModal(false);
        setUserForm({ name: '', email: '', password: '', role: 'USER', organizationId: 1 });
        fetchDashboardData();
        fetchUsers();
      } else {
        const error = await response.text();
        toast.error(`Failed to create user: ${error}`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
  };

  // Handle Project Creation
  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      console.log('Creating project:', projectForm);
      await projectService.create(projectForm);
      toast.success('Project created successfully');
      setShowProjectModal(false);
      setProjectForm({ name: '', description: '', status: 'ACTIVE' });
      fetchDashboardData();
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    if (!taskForm.title) {
      toast.error('Task title is required');
      return;
    }
    
    if (!taskForm.projectId) {
      toast.error('Please select a project');
      return;
    }
    
    try {
      const selectedUser = users.find(u => u.email === taskForm.assignedTo);
      
      let formattedDueDate = null;
      if (taskForm.dueDate) {
        formattedDueDate = `${taskForm.dueDate}T00:00:00`;
      }
      
      const taskData = {
        title: taskForm.title,
        description: taskForm.description || '',
        status: 'TODO',
        priority: taskForm.priority,
        dueDate: formattedDueDate,
        project: { id: parseInt(taskForm.projectId) },
        assignedToEmail: selectedUser?.email || taskForm.assignedTo || null,
        assignedToName: selectedUser?.name || null,
        assignedTo: selectedUser ? { id: selectedUser.id } : null
      };
      
      console.log('📝 Creating task with data:', JSON.stringify(taskData, null, 2));
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/tasks/project/${taskForm.projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });
      
      const responseText = await response.text();
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(responseText || 'Failed to create task');
      }
      
      toast.success(`Task assigned to ${selectedUser?.name || taskForm.assignedTo || 'user'} successfully`);
      setShowTaskModal(false);
      
      setTaskForm({
        title: '',
        description: '',
        projectId: '',
        assignedTo: '',
        assignedToEmail: '',
        assignedToName: '',
        priority: 'MEDIUM',
        status: 'TODO',
        dueDate: ''
      });
      
      fetchDashboardData();
      fetchActivityStats(); // Refresh activity stats after task creation
      
    } catch (error) {
      console.error('❌ Error:', error);
      let errorMessage = error.message;
      try {
        const errorObj = JSON.parse(error.message);
        errorMessage = errorObj.message || error.message;
      } catch (e) {
        // Not JSON, use as is
      }
      toast.error(`Failed: ${errorMessage}`);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: FiUsers,
      change: `+${Math.floor(Math.random() * 20)}%`,
      trend: 'positive',
      link: '/admin/users'
    },
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: FiFolder,
      change: `+${Math.floor(Math.random() * 15)}%`,
      trend: 'positive',
      link: '/admin/projects'
    },
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: FiCheckCircle,
      change: `+${Math.floor(Math.random() * 25)}%`,
      trend: 'positive',
      link: '/admin/projects'
    },
    {
      title: 'Completed',
      value: stats.completedTasks,
      icon: FiTrendingUp,
      change: `+${Math.floor(Math.random() * 30)}%`,
      trend: stats.completedTasks > 0 ? 'positive' : 'neutral',
      link: null
    }
  ];

  if (loading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Dashboard Overview</h1>
            <p>Welcome back! Here's what's happening with your platform.</p>
          </div>
          <div className="header-right">
            <div className="header-badge">
              <span>📅 {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
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
              <div className="stat-icon-wrapper">
                <stat.icon />
              </div>
              <div className="stat-content">
                <h3>{stat.title}</h3>
                <div className="stat-main">
                  <span className="stat-value">{stat.value}</span>
                  <span className={`stat-change ${stat.trend}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          {/* Platform Activity */}
          <motion.div 
            className="chart-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="chart-header">
              <h3>
                <FiActivity className="chart-icon" />
                Platform Activity
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
              {weeklyActivity.length === 0 ? (
                <div className="chart-empty">
                  <p>No activity data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'white', 
                        border: 'none', 
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                      }}
                      formatter={(value) => [`${value} activities`, 'Count']}
                    />
                    <Legend />
                    <Bar dataKey="tasks" name="Activities" fill="#667eea" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Task Distribution */}
          <motion.div 
            className="chart-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="chart-header">
              <h3>Task Distribution</h3>
            </div>
            <div className="pie-container">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={taskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {taskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {taskDistribution.map((item, index) => (
                  <div key={index} className="legend-item">
                    <span className="legend-color" style={{ background: item.color }}></span>
                    <span className="legend-label">{item.name}</span>
                    <span className="legend-value">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div 
          className="activity-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="activity-header">
            <h3>
              🔥 Recent Activity
              <span className="activity-badge">{recentActivities.length} new</span>
            </h3>
            <button className="view-all-btn" onClick={() => navigate('/admin/activity')}>
              View All <span>→</span>
            </button>
          </div>
          
          <div className="activity-list">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <motion.div 
                  key={activity.id} 
                  className="activity-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + (index * 0.1) }}
                  whileHover={{ scale: 1.02, x: 10 }}
                >
                  <div className="activity-avatar" style={{ 
                    background: `linear-gradient(135deg, ${activity.color}20, ${activity.color}40)`,
                    color: activity.color
                  }}>
                    {activity.avatar}
                  </div>
                  <div className="activity-content">
                    <p>
                      <strong>{activity.user}</strong> {activity.action}{' '}
                      {activity.target && (
                        <span className="activity-target">{activity.target}</span>
                      )}
                    </p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                  <button className="activity-menu">
                    <FiMoreVertical />
                  </button>
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="empty-icon">📭</div>
                <h4>No Recent Activity</h4>
                <p>Activities will appear here when users interact with the platform</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Quick Action Buttons */}
        <div className="quick-actions">
          <motion.button 
            className="quick-action-btn"
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddUserClick}
          >
            <FiUserPlus /> Add User
          </motion.button>
          <motion.button 
            className="quick-action-btn"
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNewProjectClick}
          >
            <FiPlusCircle /> New Project
          </motion.button>
          <motion.button 
            className="quick-action-btn"
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateTaskClick}
          >
            <FiCheckSquare /> Create Task
          </motion.button>
        </div>

        {/* Modals remain the same */}
        <Modal isOpen={showUserModal} onClose={() => setShowUserModal(false)} title="Create New User">
          <form onSubmit={handleCreateUser}>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                className="form-control"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                required
                placeholder="Enter full name"
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                className="form-control"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                required
                placeholder="Enter email address"
              />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                className="form-control"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                required
                placeholder="Enter password"
                minLength="6"
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                className="form-control"
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              >
                <option value="USER">User</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Create User
            </button>
          </form>
        </Modal>

        <Modal isOpen={showProjectModal} onClose={() => setShowProjectModal(false)} title="Create New Project">
          <form onSubmit={handleCreateProject}>
            <div className="form-group">
              <label>Project Name *</label>
              <input
                type="text"
                className="form-control"
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                required
                placeholder="Enter project name"
              />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea
                className="form-control"
                rows="3"
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                required
                placeholder="Enter project description"
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                className="form-control"
                value={projectForm.status}
                onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Create Project
            </button>
          </form>
        </Modal>

        <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create New Task">
          <form onSubmit={handleCreateTask}>
            <div className="form-group">
              <label>Title <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="text"
                className="form-control"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                required
                placeholder="Enter task title"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-control"
                rows="3"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Enter task description"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Project <span style={{ color: '#ef4444' }}>*</span></label>
                <select
                  className="form-control"
                  value={taskForm.projectId}
                  onChange={(e) => setTaskForm({ ...taskForm, projectId: e.target.value })}
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Assigned To</label>
                <select
                  className="form-control"
                  value={taskForm.assignedTo}
                  onChange={(e) => {
                    const selectedEmail = e.target.value;
                    const selectedUser = users.find(u => u.email === selectedEmail);
                    setTaskForm({ 
                      ...taskForm, 
                      assignedTo: selectedEmail,
                      assignedToEmail: selectedEmail,
                      assignedToName: selectedUser?.name 
                    });
                  }}
                >
                  <option value="">-- Unassigned --</option>
                  {users.map(user => (
                    <option key={user.id} value={user.email}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Priority</label>
                <select
                  className="form-control"
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>
                Create Task
              </button>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setShowTaskModal(false)}
                style={{ flex: 1, padding: '12px' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default AdminDashboard;