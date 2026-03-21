import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiUsers } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import CollaboratorList from '../../components/collaborators/CollaboratorList';
import ActivityLog from '../../components/collaborators/ActivityLog';
import { collaboratorService } from '../../services/collaboratorService';
import { projectService } from '../../services/projectService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import './ProjectCollaborators.css';

const ProjectCollaborators = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('collaborators');

  useEffect(() => {
    console.log('Project ID from URL:', projectId);
    
    if (!projectId) {
      setError('No project ID provided');
      setLoading(false);
      return;
    }
    
    if (location.state?.project) {
      console.log('Project from location state:', location.state.project);
      setProject(location.state.project);
    }
    
    fetchProjectDetails();
    fetchCollaborators();
  }, [projectId, location.state]);

  const fetchProjectDetails = async () => {
    if (!projectId) return;
    
    try {
      console.log('Fetching project details for ID:', projectId);
      const response = await projectService.getById(projectId);
      console.log('Project details response:', response.data);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Failed to load project details');
      toast.error('Failed to load project details');
    }
  };

  const fetchCollaborators = async () => {
    if (!projectId) return;
    
    try {
      console.log('Fetching collaborators for project:', projectId);
      const response = await collaboratorService.getProjectCollaborators(projectId);
      console.log('Collaborators response:', response.data);
      
      // Filter out inactive collaborators
      const activeCollaborators = response.data.filter(c => c?.isActive !== false);
      setCollaborators(activeCollaborators);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      toast.error('Failed to load collaborators');
    } finally {
      setLoading(false);
    }
  };

  const handleCollaboratorUpdate = (updatedCollaborators) => {
    // Filter out inactive ones when updating
    const activeCollaborators = updatedCollaborators.filter(c => c?.isActive !== false);
    setCollaborators(activeCollaborators);
  };

  const handleBack = () => {
    navigate('/manager/projects');
  };

  // Calculate stats from current collaborators
  const stats = {
    total: collaborators.length,
    active: collaborators.filter(c => c?.isAccepted && !c?.isExpired).length,
    pending: collaborators.filter(c => !c?.isAccepted).length,
    expired: collaborators.filter(c => c?.isExpired).length
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

  if (error) {
    return (
      <Layout>
        <div className="error-container">
          <div className="error-card">
            <h2>❌ {error}</h2>
            <p>Project ID: {projectId || 'Not provided'}</p>
            <button onClick={handleBack} className="back-button">
              <FiArrowLeft /> Back to Projects
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="project-collaborators-page">
        {/* Header */}
        <div className="page-header">
          <button
            className="back-button"
            onClick={handleBack}
          >
            <FiArrowLeft /> Back to Projects
          </button>
          
          <div className="header-content">
            <h1>
              <FiUsers className="header-icon" />
              Project Collaborators
            </h1>
            {project && (
              <div className="project-title-badge">
                <span className="project-name">{project.name}</span>
                <span className={`project-status status-${project.status?.toLowerCase() || 'active'}`}>
                  {project.status || 'ACTIVE'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Project Stats - These should match */}
        {project && (
          <div className="project-stats">
            <div className="stat-item">
              <span className="stat-label">Project ID</span>
              <span className="stat-value">{project.id}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Collaborators</span>
              <span className="stat-value">{stats.total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Active</span>
              <span className="stat-value success">{stats.active}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pending</span>
              <span className="stat-value warning">{stats.pending}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Expired</span>
              <span className="stat-value expired">{stats.expired}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'collaborators' ? 'active' : ''}`}
            onClick={() => setActiveTab('collaborators')}
          >
            Collaborators ({stats.total})
          </button>
          <button
            className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Activity Log
          </button>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="tab-content"
        >
          {activeTab === 'collaborators' ? (
            <CollaboratorList
              projectId={parseInt(projectId)}
              projectName={project?.name || 'Project'}
              collaborators={collaborators}
              onCollaboratorUpdate={handleCollaboratorUpdate}
            />
          ) : (
            <ActivityLog projectId={parseInt(projectId)} />
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default ProjectCollaborators;