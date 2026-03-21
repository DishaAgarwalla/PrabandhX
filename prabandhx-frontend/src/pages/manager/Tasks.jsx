import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiPlus,
  FiRefreshCw,
  FiFilter,
  FiArrowLeft
} from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import TaskCard from '../../components/tasks/TaskCard';
import TaskForm from '../../components/tasks/TaskForm';
import { taskService } from '../../services/taskService';
import { projectService } from '../../services/projectService';
import { userService } from '../../services/userService';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import './Manager.css';

const ManagerTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        taskService.getAll(),
        projectService.getAll(),
        userService.getAll()
      ]);
      
      const tasksData = tasksRes.data?.content || tasksRes.data || [];
      const projectsData = projectsRes.data?.content || projectsRes.data || [];
      const usersData = usersRes.data || [];
      
      setTasks(tasksData);
      setProjects(projectsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (formData) => {
    try {
      await taskService.create(formData);
      toast.success('Task created successfully');
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId, formData) => {
    try {
      await taskService.update(taskId, formData);
      toast.success('Task updated successfully');
      setShowTaskModal(false);
      setSelectedTask(null);
      fetchData();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateStatus(taskId, newStatus);
      toast.success('Status updated');
      fetchData();
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
    toast.loading('Refreshing...', { id: 'refresh' });
    fetchData().then(() => {
      toast.success('Data refreshed!', { id: 'refresh' });
    });
  };

  const getFilteredTasks = () => {
    let filtered = tasks;
    
    if (filter !== 'all') {
      filtered = filtered.filter(t => t.status === filter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignedToName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredTasks = getFilteredTasks();
  const taskCounts = {
    all: tasks.length,
    TODO: tasks.filter(t => t.status === 'TODO').length,
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    COMPLETED: tasks.filter(t => t.status === 'COMPLETED').length
  };

  if (loading) return <Layout><Loader /></Layout>;

  return (
    <Layout>
      <div className="manager-tasks-container">
        {/* Header */}
        <div className="tasks-header">
          <div className="header-left">
            <button 
              className="back-button"
              onClick={() => navigate('/manager/dashboard')}
            >
              <FiArrowLeft /> Back to Dashboard
            </button>
            <div className="header-title">
              <h1>Task Management</h1>
              <p>Manage all tasks across projects</p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="refresh-button"
              onClick={handleRefresh}
            >
              <FiRefreshCw /> Refresh
            </button>
            <button 
              className="create-button"
              onClick={() => setShowModal(true)}
            >
              <FiPlus /> New Task
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card total">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <span className="stat-label">Total Tasks</span>
              <span className="stat-value">{taskCounts.all}</span>
            </div>
          </div>
          <div className="stat-card todo">
            <div className="stat-icon">📝</div>
            <div className="stat-info">
              <span className="stat-label">To Do</span>
              <span className="stat-value">{taskCounts.TODO}</span>
            </div>
          </div>
          <div className="stat-card progress">
            <div className="stat-icon">⚡</div>
            <div className="stat-info">
              <span className="stat-label">In Progress</span>
              <span className="stat-value">{taskCounts.IN_PROGRESS}</span>
            </div>
          </div>
          <div className="stat-card completed">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <span className="stat-label">Completed</span>
              <span className="stat-value">{taskCounts.COMPLETED}</span>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="search-filter-bar">
          <div className="search-box">
            <FiFilter className="search-icon" />
            <input
              type="text"
              placeholder="Search tasks by title, description, project or assignee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All <span className="count">{taskCounts.all}</span>
            </button>
            <button
              className={`filter-tab ${filter === 'TODO' ? 'active' : ''}`}
              onClick={() => setFilter('TODO')}
            >
              To Do <span className="count">{taskCounts.TODO}</span>
            </button>
            <button
              className={`filter-tab ${filter === 'IN_PROGRESS' ? 'active' : ''}`}
              onClick={() => setFilter('IN_PROGRESS')}
            >
              In Progress <span className="count">{taskCounts.IN_PROGRESS}</span>
            </button>
            <button
              className={`filter-tab ${filter === 'COMPLETED' ? 'active' : ''}`}
              onClick={() => setFilter('COMPLETED')}
            >
              Completed <span className="count">{taskCounts.COMPLETED}</span>
            </button>
          </div>
        </div>

        {/* Tasks Grid */}
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{searchTerm ? '🔍' : '📋'}</div>
            <h3>{searchTerm ? 'No matching tasks' : 'No tasks yet'}</h3>
            <p>
              {searchTerm 
                ? `No tasks match "${searchTerm}"`
                : "Create your first task to get started"}
            </p>
            {!searchTerm && (
              <button 
                className="create-button"
                onClick={() => setShowModal(true)}
              >
                <FiPlus /> Create Task
              </button>
            )}
          </div>
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

        {/* Create Task Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Task">
          <TaskForm
            projects={projects}
            users={users}
            onSubmit={handleCreateTask}
            onCancel={() => setShowModal(false)}
          />
        </Modal>

        {/* Edit Task Modal */}
        <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Edit Task">
          {selectedTask && (
            <TaskForm
              initialData={selectedTask}
              projects={projects}
              users={users}
              onSubmit={(data) => handleUpdateTask(selectedTask.id, data)}
              onCancel={() => setShowTaskModal(false)}
              isEditing={true}
            />
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default ManagerTasks;