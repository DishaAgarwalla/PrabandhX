import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiFolder, FiEye, FiCalendar, FiUser } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import { collaboratorService } from '../../services/collaboratorService';
import PermissionBadge from '../../components/collaborators/PermissionBadge';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import './SharedProjects.css';

const SharedProjects = () => {
  const navigate = useNavigate();
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSharedProjects();
  }, []);

  const fetchSharedProjects = async () => {
    try {
      const response = await collaboratorService.getMyCollaborations();
      setCollaborations(response.data);
    } catch (error) {
      console.error('Error fetching shared projects:', error);
      toast.error('Failed to load shared projects');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (expiresAt) => {
    if (!expiresAt) return null;
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="status-badge expired">Expired</span>;
    } else if (diffDays <= 3) {
      return <span className="status-badge expiring-soon">Expiring in {diffDays} days</span>;
    }
    return null;
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
      <div className="shared-projects-page">
        {/* Header */}
        <div className="page-header">
          <h1>
            <FiUsers className="header-icon" />
            Shared with Me
          </h1>
          <p>Projects where you are a collaborator</p>
        </div>

        {collaborations.length === 0 ? (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="empty-icon">🤝</div>
            <h3>No shared projects</h3>
            <p>Projects shared with you will appear here</p>
            <p className="empty-hint">
              When someone invites you to collaborate on a project, you'll see it here after accepting the invitation.
            </p>
          </motion.div>
        ) : (
          <div className="projects-grid">
            {collaborations.map((collab, index) => (
              <motion.div
                key={collab.id}
                className="project-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)' }}
              >
                <div className="project-header">
                  <div className="project-icon">
                    <FiFolder />
                  </div>
                  <div className="project-info">
                    <h3>{collab.projectName}</h3>
                    <div className="permission-wrapper">
                      <PermissionBadge permission={collab.permissionLevel} size="small" />
                      {getStatusBadge(collab.expiresAt)}
                    </div>
                  </div>
                </div>

                <div className="project-details">
                  <div className="detail-item">
                    <FiUser className="detail-icon" />
                    <span>Invited by: {collab.invitedByName || 'Unknown'}</span>
                  </div>
                  <div className="detail-item">
                    <FiCalendar className="detail-icon" />
                    <span>Invited: {formatDate(collab.invitedAt)}</span>
                  </div>
                  {collab.expiresAt && (
                    <div className="detail-item">
                      <FiCalendar className="detail-icon" />
                      <span>Access expires: {formatDate(collab.expiresAt)}</span>
                    </div>
                  )}
                </div>

                <div className="project-footer">
                  <button
                    className="view-project-btn"
                    onClick={() => navigate(`/user/projects/${collab.projectId}`)}
                  >
                    <FiEye /> View Project
                  </button>
                </div>

                {collab.permissionLevel === 'VIEWER' && (
                  <div className="access-badge viewer">
                    <span>View Only</span>
                  </div>
                )}
                {collab.permissionLevel === 'UPLOADER' && (
                  <div className="access-badge uploader">
                    <span>Can Upload</span>
                  </div>
                )}
                {collab.permissionLevel === 'EDITOR' && (
                  <div className="access-badge editor">
                    <span>Can Edit</span>
                  </div>
                )}
                {collab.permissionLevel === 'ADMIN' && (
                  <div className="access-badge admin">
                    <span>Full Access</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SharedProjects;