import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft,
  FiRefreshCw,
  FiFilter,
  FiUser,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiAlertCircle
} from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import TaskCard from '../../components/tasks/TaskCard';
import { taskService } from '../../services/taskService';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import './User.css';

const MyTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        
        // Ensure user object has ID from token if missing
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
        toast.error('Session expired. Please login again.');
        localStorage.clear();
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      fetchMyTasks();
    }
  }, [currentUser]);

  const fetchMyTasks = async () => {
    setLoading(true);
    try {
      const response = await taskService.getAll();
      
      let allTasks = [];
      if (response.data?.content) {
        allTasks = response.data.content;
      } else if (Array.isArray(response.data)) {
        allTasks = response.data;
      } else {
        allTasks = response.data || [];
      }
      
      // Filter tasks assigned to current user
      const myTasks = allTasks.filter(task => {
        // Check by user ID (most reliable)
        if (task.assignedToId && currentUser.id) {
          return task.assignedToId.toString() === currentUser.id.toString();
        }
        
        // Check by email as fallback
        if (task.assignedToEmail) {
          return task.assignedToEmail.toLowerCase() === currentUser.email?.toLowerCase();
        }
        
        // Check assignedTo object
        if (task.assignedTo?.id) {
          return task.assignedTo.id.toString() === currentUser.id.toString();
        }
        
        return false;
      });
      
      setTasks(myTasks);
      
      // Calculate stats
      const todo = myTasks.filter(t => t.status === 'TODO').length;
      const inProgress = myTasks.filter(t => t.status === 'IN_PROGRESS').length;
      const completed = myTasks.filter(t => t.status === 'COMPLETED').length;
      const overdue = myTasks.filter(t => {
        if (t.status === 'COMPLETED' || !t.dueDate) return false;
        return new Date(t.dueDate) < new Date();
      }).length;
      
      setStats({
        total: myTasks.length,
        todo,
        inProgress,
        completed,
        overdue
      });
      
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateStatus(taskId, newStatus);
      toast.success('Task status updated');
      fetchMyTasks();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleRefresh = () => {
    fetchMyTasks();
    toast.success('Tasks refreshed!');
  };

  const getFilteredTasks = () => {
    let filtered = [...tasks];
    
    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(t => {
        if (filter === 'todo') return t.status === 'TODO';
        if (filter === 'in-progress') return t.status === 'IN_PROGRESS';
        if (filter === 'completed') return t.status === 'COMPLETED';
        if (filter === 'overdue') {
          if (t.status === 'COMPLETED' || !t.dueDate) return false;
          return new Date(t.dueDate) < new Date();
        }
        return true;
      });
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(task => 
        task.title?.toLowerCase().includes(term) ||
        task.description?.toLowerCase().includes(term) ||
        task.projectName?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  };

  const filteredTasks = getFilteredTasks();

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
      <div className="my-tasks-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <button 
              className="back-button"
              onClick={() => navigate('/user/dashboard')}
            >
              <FiArrowLeft /> Dashboard
            </button>
            <div className="header-title">
              <h1>My Tasks</h1>
              <p>Manage your assigned tasks and track progress</p>
            </div>
          </div>
          <button 
            className="refresh-button"
            onClick={handleRefresh}
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>

        {/* User Profile Summary */}
        <div className="user-profile-card">
          <div className="user-avatar">
            <FiUser />
          </div>
          <div className="user-details">
            <h2>{currentUser?.name || 'User'}</h2>
            <p>{currentUser?.email}</p>
          </div>
          <div className="user-task-count">
            <span className="count">{stats.total}</span>
            <span className="label">Total Tasks</span>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <motion.div 
            className="stat-card total"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Tasks</span>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card todo"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <span className="stat-value">{stats.todo}</span>
              <span className="stat-label">To Do</span>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card progress"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <span className="stat-value">{stats.inProgress}</span>
              <span className="stat-label">In Progress</span>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card completed"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <span className="stat-value">{stats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card overdue"
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <span className="stat-value">{stats.overdue}</span>
              <span className="stat-label">Overdue</span>
            </div>
          </motion.div>
        </div>

        {/* Search and Filter Bar */}
        <div className="filter-section">
          <div className="search-box">
            <FiFilter className="search-icon" />
            <input
              type="text"
              placeholder="Search tasks by title, description or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All <span className="count">{stats.total}</span>
            </button>
            <button
              className={`filter-tab ${filter === 'todo' ? 'active' : ''}`}
              onClick={() => setFilter('todo')}
            >
              To Do <span className="count">{stats.todo}</span>
            </button>
            <button
              className={`filter-tab ${filter === 'in-progress' ? 'active' : ''}`}
              onClick={() => setFilter('in-progress')}
            >
              In Progress <span className="count">{stats.inProgress}</span>
            </button>
            <button
              className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed <span className="count">{stats.completed}</span>
            </button>
            <button
              className={`filter-tab ${filter === 'overdue' ? 'active' : ''}`}
              onClick={() => setFilter('overdue')}
            >
              Overdue <span className="count">{stats.overdue}</span>
            </button>
          </div>
        </div>

        {/* Tasks Grid */}
        {filteredTasks.length === 0 ? (
          <motion.div 
            className="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="empty-icon">
              {searchTerm ? '🔍' : '📋'}
            </div>
            <h3>
              {searchTerm 
                ? 'No matching tasks' 
                : 'No tasks assigned'}
            </h3>
            <p>
              {searchTerm 
                ? `No tasks match "${searchTerm}"`
                : "You don't have any tasks assigned yet."}
            </p>
            {!searchTerm && stats.total === 0 && (
              <div className="empty-state-hint">
                <FiAlertCircle />
                <span>Tasks assigned by your admin will appear here</span>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="tasks-grid">
            {filteredTasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onView={handleViewTask}
              />
            ))}
          </div>
        )}

        {/* Task Details Modal */}
        <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Task Details">
          {selectedTask && (
            <div className="task-detail-modal">
              <div className="detail-header">
                <h2>{selectedTask.title}</h2>
                <span className={`status-badge ${selectedTask.status?.toLowerCase()}`}>
                  {selectedTask.status?.replace('_', ' ') || 'TODO'}
                </span>
              </div>
              
              <div className="detail-section">
                <h4>Description</h4>
                <p>{selectedTask.description || 'No description provided'}</p>
              </div>
              
              <div className="detail-grid">
                <div className="detail-item">
                  <FiBriefcase className="item-icon" />
                  <div>
                    <span className="item-label">Project</span>
                    <span className="item-value">{selectedTask.projectName || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="detail-item">
                  <span className="item-icon">🏷️</span>
                  <div>
                    <span className="item-label">Priority</span>
                    <span className={`priority-badge ${selectedTask.priority?.toLowerCase()}`}>
                      {selectedTask.priority || 'MEDIUM'}
                    </span>
                  </div>
                </div>
                
                <div className="detail-item">
                  <FiCalendar className="item-icon" />
                  <div>
                    <span className="item-label">Due Date</span>
                    <span className="item-value">
                      {selectedTask.dueDate 
                        ? new Date(selectedTask.dueDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : 'No due date'}
                    </span>
                  </div>
                </div>
                
                <div className="detail-item">
                  <FiUser className="item-icon" />
                  <div>
                    <span className="item-label">Assigned To</span>
                    <span className="item-value">
                      {selectedTask.assignedToName || selectedTask.assignedTo?.name || 'You'}
                    </span>
                  </div>
                </div>

                {selectedTask.storyPoints && (
                  <div className="detail-item">
                    <span className="item-icon">⭐</span>
                    <div>
                      <span className="item-label">Story Points</span>
                      <span className="item-value">{selectedTask.storyPoints}</span>
                    </div>
                  </div>
                )}

                {selectedTask.completedAt && (
                  <div className="detail-item">
                    <FiCheckCircle className="item-icon" />
                    <div>
                      <span className="item-label">Completed On</span>
                      <span className="item-value">
                        {new Date(selectedTask.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="detail-actions">
                <select
                  value={selectedTask.status || 'TODO'}
                  onChange={(e) => {
                    handleStatusChange(selectedTask.id, e.target.value);
                    setShowTaskModal(false);
                  }}
                  className={`status-select ${(selectedTask.status || 'TODO').toLowerCase()}`}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                <button 
                  className="close-button"
                  onClick={() => setShowTaskModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default MyTasks;