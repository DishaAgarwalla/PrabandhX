import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiFolder, FiUsers, FiFile, FiEdit2, FiCalendar } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import { projectService } from '../../services/projectService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import './ProjectView.css';

const ProjectView = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const handleManageCollaborators = () => {
    navigate(`/manager/projects/${projectId}/collaborators`);
  };

  const handleViewTasks = () => {
    navigate(`/manager/tasks?projectId=${projectId}`);
  };

  const handleViewFiles = () => {
    navigate(`/manager/files?projectId=${projectId}`);
  };

  if (loading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="project-view-page">
        <button 
          className="back-button"
          onClick={() => navigate('/manager/projects')}
        >
          <FiArrowLeft /> Back to Projects
        </button>

        <div className="project-header">
          <div className="title-section">
            <h1>{project?.name}</h1>
            <span className={`status-badge ${project?.status?.toLowerCase()}`}>
              {project?.status}
            </span>
          </div>
          <button 
            className="manage-btn"
            onClick={handleManageCollaborators}
          >
            <FiUsers /> Manage Collaborators
          </button>
        </div>

        <p className="project-description">
          {project?.description || 'No description provided'}
        </p>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button onClick={handleViewTasks} className="action-btn">
            <FiFolder /> View Tasks
          </button>
          <button onClick={handleViewFiles} className="action-btn">
            <FiFile /> Project Files
          </button>
          <button onClick={handleManageCollaborators} className="action-btn">
            <FiUsers /> Collaborators
          </button>
        </div>

        {/* Stats Cards */}
        <div className="project-stats">
          <div className="stat-card">
            <span className="stat-label">Total Tasks</span>
            <span className="stat-value">{project?.taskCount || 0}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Collaborators</span>
            <span className="stat-value">{project?.collaboratorCount || 1}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Created</span>
            <span className="stat-value">
              {project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Progress</span>
            <span className="stat-value">{project?.overallProgress || 0}%</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectView;