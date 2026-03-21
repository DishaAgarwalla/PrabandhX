import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiCalendar, FiUsers, FiFolder, FiCheckCircle } from 'react-icons/fi';
import { 
  LineChart, 
  Line, 
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
import { taskService } from '../../services/taskService';
import { userService } from '../../services/userService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import './Admin.css';

const Reports = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    activeProjects: 0,
    completedProjects: 0,
    onHoldProjects: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('overview');
  const [timeRange, setTimeRange] = useState('6months');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    console.log('📊 Fetching reports data...');
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
      const todoTasks = tasks.filter(t => t?.status === 'TODO').length;
      const inProgressTasks = tasks.filter(t => t?.status === 'IN_PROGRESS').length;
      
      const activeProjects = projects.filter(p => p?.status === 'ACTIVE').length;
      const completedProjects = projects.filter(p => p?.status === 'COMPLETED').length;
      const onHoldProjects = projects.filter(p => p?.status === 'ON_HOLD').length;

      setStats({
        totalUsers: users.length,
        totalProjects: projects.length,
        totalTasks: tasks.length,
        completedTasks,
        todoTasks,
        inProgressTasks,
        activeProjects,
        completedProjects,
        onHoldProjects
      });

      // Generate REAL monthly data from actual projects and tasks
      generateMonthlyData(projects, tasks);

    } catch (error) {
      console.error('❌ Error fetching reports:', error);
      toast.error('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyData = (projects, tasks) => {
    // Get last 6 months
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = monthNames[date.getMonth()];
      const yearShort = date.getFullYear().toString().slice(-2);
      
      months.push({
        name: monthName,
        fullDate: date,
        label: `${monthName} '${yearShort}`
      });
    }

    // Count projects per month
    const monthlyProjects = months.map(month => {
      const count = projects.filter(project => {
        if (!project.createdAt) return false;
        const projectDate = new Date(project.createdAt);
        return projectDate.getMonth() === month.fullDate.getMonth() &&
               projectDate.getFullYear() === month.fullDate.getFullYear();
      }).length;
      
      return count;
    });

    // Count tasks per month
    const monthlyTasks = months.map(month => {
      const count = tasks.filter(task => {
        if (!task.createdAt) return false;
        const taskDate = new Date(task.createdAt);
        return taskDate.getMonth() === month.fullDate.getMonth() &&
               taskDate.getFullYear() === month.fullDate.getFullYear();
      }).length;
      
      return count;
    });

    // Create chart data
    const chartData = months.map((month, index) => ({
      name: month.label,
      projects: monthlyProjects[index],
      tasks: monthlyTasks[index]
    }));

    console.log('📊 Monthly chart data:', chartData);
    setMonthlyData(chartData);
  };

  // Task distribution data for pie chart - FILTER OUT ZERO VALUES
  const taskDistribution = [
    ...(stats.completedTasks > 0 ? [{ name: 'Completed', value: stats.completedTasks, color: '#10b981' }] : []),
    ...(stats.inProgressTasks > 0 ? [{ name: 'In Progress', value: stats.inProgressTasks, color: '#f59e0b' }] : []),
    ...(stats.todoTasks > 0 ? [{ name: 'To Do', value: stats.todoTasks, color: '#ef4444' }] : [])
  ];

  // If all tasks are zero, show a placeholder
  const hasTasks = taskDistribution.length > 0;

  // Project distribution data for pie chart - FILTER OUT ZERO VALUES
  const projectDistribution = [
    ...(stats.activeProjects > 0 ? [{ name: 'Active', value: stats.activeProjects, color: '#10b981' }] : []),
    ...(stats.completedProjects > 0 ? [{ name: 'Completed', value: stats.completedProjects, color: '#3b82f6' }] : []),
    ...(stats.onHoldProjects > 0 ? [{ name: 'On Hold', value: stats.onHoldProjects, color: '#f59e0b' }] : [])
  ];

  const hasProjects = projectDistribution.length > 0;

  // Calculate max value for Y-axis
  const maxValue = Math.max(
    ...monthlyData.map(d => Math.max(d.projects, d.tasks)),
    10
  );

  // Round up to nearest 10 for nice Y-axis ticks
  const yAxisMax = Math.ceil(maxValue / 10) * 10;

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
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Analytics & Reports</h1>
            <p>Comprehensive insights into your platform's performance</p>
          </div>
          <div className="header-right">
            <div className="chart-controls">
              <button 
                className={`time-btn ${reportType === 'overview' ? 'active' : ''}`}
                onClick={() => setReportType('overview')}
              >
                Overview
              </button>
              <button 
                className={`time-btn ${reportType === 'detailed' ? 'active' : ''}`}
                onClick={() => setReportType('detailed')}
              >
                Detailed
              </button>
            </div>
            <button className="notification-btn" onClick={() => {
              // Export functionality
              const dataStr = JSON.stringify({ stats, monthlyData }, null, 2);
              const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
              const exportFileDefaultName = `prabandhx-report-${new Date().toISOString().split('T')[0]}.json`;
              const linkElement = document.createElement('a');
              linkElement.setAttribute('href', dataUri);
              linkElement.setAttribute('download', exportFileDefaultName);
              linkElement.click();
            }}>
              <FiDownload />
            </button>
          </div>
        </div>

        {/* Summary Stats Cards */}
        <div className="stats-grid">
          <motion.div 
            className="stat-card"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-icon-wrapper"><FiUsers /></div>
            <div className="stat-content">
              <h3>Total Users</h3>
              <span className="stat-value">{stats.totalUsers}</span>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stat-icon-wrapper"><FiFolder /></div>
            <div className="stat-content">
              <h3>Total Projects</h3>
              <span className="stat-value">{stats.totalProjects}</span>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="stat-icon-wrapper"><FiCheckCircle /></div>
            <div className="stat-content">
              <h3>Total Tasks</h3>
              <span className="stat-value">{stats.totalTasks}</span>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="stat-icon-wrapper"><FiCalendar /></div>
            <div className="stat-content">
              <h3>Completion Rate</h3>
              <span className="stat-value">
                {stats.totalTasks > 0 ? ((stats.completedTasks / stats.totalTasks) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </motion.div>
        </div>

        {/* Monthly Activity Trend Chart */}
        <motion.div 
          className="chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ marginBottom: '24px' }}
        >
          <div className="chart-header">
            <h3>Monthly Activity Trend</h3>
            <div className="chart-controls">
              <button 
                className={`time-btn ${timeRange === '6months' ? 'active' : ''}`}
                onClick={() => setTimeRange('6months')}
              >
                6 Months
              </button>
              <button 
                className={`time-btn ${timeRange === '12months' ? 'active' : ''}`}
                onClick={() => setTimeRange('12months')}
              >
                12 Months
              </button>
            </div>
          </div>
          <div className="chart-container">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b" 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    domain={[0, yAxisMax]}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    ticks={Array.from({ length: yAxisMax/10 + 1 }, (_, i) => i * 10)}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'white', 
                      border: 'none', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      padding: '12px'
                    }}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '5px' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    iconType="circle"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tasks" 
                    name="Tasks" 
                    stroke="#667eea" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#667eea' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="projects" 
                    name="Projects" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10b981' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">
                <p>No data available for the selected period</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Charts Grid for Distribution */}
        <div className="charts-section">
          {/* Task Distribution Pie Chart - FIXED */}
          <motion.div 
            className="chart-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="chart-header">
              <h3>Task Distribution</h3>
            </div>
            <div className="pie-container">
              {hasTasks ? (
                <>
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
                        label={({ name, percent }) => {
                          const percentage = (percent * 100).toFixed(0);
                          return percentage > 0 ? `${name} ${percentage}%` : '';
                        }}
                      >
                        {taskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} tasks`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pie-legend">
                    {taskDistribution.map((item, index) => (
                      <div key={index} className="legend-item">
                        <span className="legend-color" style={{ background: item.color }}></span>
                        <span className="legend-label">{item.name}:</span>
                        <span className="legend-value">{item.value} {item.value === 1 ? 'task' : 'tasks'}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-pie">
                  <p>No tasks available</p>
                  <p className="empty-sub">Create tasks to see distribution</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Project Distribution Pie Chart - FIXED */}
          <motion.div 
            className="chart-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="chart-header">
              <h3>Project Distribution</h3>
            </div>
            <div className="pie-container">
              {hasProjects ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={projectDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => {
                          const percentage = (percent * 100).toFixed(0);
                          return percentage > 0 ? `${name} ${percentage}%` : '';
                        }}
                      >
                        {projectDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} projects`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pie-legend">
                    {projectDistribution.map((item, index) => (
                      <div key={index} className="legend-item">
                        <span className="legend-color" style={{ background: item.color }}></span>
                        <span className="legend-label">{item.name}:</span>
                        <span className="legend-value">{item.value} {item.value === 1 ? 'project' : 'projects'}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-pie">
                  <p>No projects available</p>
                  <p className="empty-sub">Create projects to see distribution</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Summary Table */}
        <motion.div 
          className="chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{ marginTop: '24px' }}
        >
          <div className="chart-header">
            <h3>Platform Summary</h3>
          </div>
          <div className="summary-grid">
            <div className="summary-item">
              <h4>Users</h4>
              <p className="summary-value">{stats.totalUsers}</p>
              <p className="summary-label">Total registered users</p>
            </div>
            <div className="summary-item">
              <h4>Projects</h4>
              <p className="summary-value">{stats.totalProjects}</p>
              <p className="summary-label">
                {stats.activeProjects > 0 && `${stats.activeProjects} active`}
                {stats.activeProjects > 0 && stats.completedProjects > 0 && ' • '}
                {stats.completedProjects > 0 && `${stats.completedProjects} completed`}
                {stats.onHoldProjects > 0 && ` • ${stats.onHoldProjects} on hold`}
              </p>
            </div>
            <div className="summary-item">
              <h4>Tasks</h4>
              <p className="summary-value">{stats.totalTasks}</p>
              <p className="summary-label">
                {stats.completedTasks > 0 && `${stats.completedTasks} completed`}
                {stats.completedTasks > 0 && stats.inProgressTasks > 0 && ' • '}
                {stats.inProgressTasks > 0 && `${stats.inProgressTasks} in progress`}
                {stats.todoTasks > 0 && ` • ${stats.todoTasks} to do`}
              </p>
            </div>
            <div className="summary-item">
              <h4>Completion</h4>
              <p className="summary-value">
                {stats.totalTasks > 0 ? ((stats.completedTasks / stats.totalTasks) * 100).toFixed(1) : 0}%
              </p>
              <p className="summary-label">Overall task completion rate</p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Reports;