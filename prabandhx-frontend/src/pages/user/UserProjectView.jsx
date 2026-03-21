import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiFolder, FiUsers, FiFile, FiCalendar, FiUser, FiList } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import { projectService } from '../../services/projectService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import './UserProjectView.css';

const UserProjectView = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' only

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const response = await projectService.getById(projectId);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
      <div className="user-project-view">
        <button 
          className="back-button"
          onClick={() => navigate('/user/shared-projects')}
        >
          <FiArrowLeft /> Back to Shared Projects
        </button>

        <div className="project-header">
          <h1>{project?.name}</h1>
          <span className={`status-badge ${project?.status?.toLowerCase()}`}>
            {project?.status || 'ACTIVE'}
          </span>
        </div>

        <div className="project-meta">
          <div className="meta-item">
            <FiUser className="meta-icon" />
            <span>Manager: {project?.managerName || 'N/A'}</span>
          </div>
          <div className="meta-item">
            <FiCalendar className="meta-icon" />
            <span>Created: {formatDate(project?.createdAt)}</span>
          </div>
        </div>

        <div className="project-description">
          <h3>About this project</h3>
          <p>{project?.description || 'No description provided.'}</p>
        </div>

        {/* Overview Section */}
        <div className="project-stats">
          <div className="stat-card">
            <FiFolder className="stat-icon" />
            <div className="stat-info">
              <span className="stat-label">Total Tasks</span>
              <span className="stat-value">{project?.taskCount || 0}</span>
            </div>
          </div>
          <div className="stat-card">
            <FiUsers className="stat-icon" />
            <div className="stat-info">
              <span className="stat-label">Team Members</span>
              <span className="stat-value">{project?.collaboratorCount || 1}</span>
            </div>
          </div>
          <div className="stat-card">
            <FiFile className="stat-icon" />
            <div className="stat-info">
              <span className="stat-label">Project Files</span>
              <span className="stat-value">0</span>
            </div>
          </div>
          <div className="stat-card">
            <FiCalendar className="stat-icon" />
            <div className="stat-info">
              <span className="stat-label">Progress</span>
              <span className="stat-value">{project?.overallProgress || 0}%</span>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <button 
            className="action-btn"
            onClick={() => navigate(`/user/tasks?projectId=${projectId}`)}
          >
            <FiFolder /> View Tasks
          </button>
          <button 
            className="action-btn"
            onClick={() => navigate(`/user/files?projectId=${projectId}`)}
          >
            <FiFile /> View Files
          </button>
        </div>

        <div className="permission-note">
          <p>🔒 You have <strong>{project?.userRole || 'VIEWER'}</strong> access to this project</p>
        </div>
      </div>
    </Layout>
  );
};

export default UserProjectView;