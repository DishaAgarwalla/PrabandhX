import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import ActivityLog from '../../components/activity/ActivityLog';
import { FiArrowLeft, FiFolder } from 'react-icons/fi';
import { projectService } from '../../services/projectService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import './ProjectActivityLog.css';

const ProjectActivityLog = () => {
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
      <div className="project-activity-log">
        <div className="page-header">
          <button 
            className="back-button"
            onClick={() => navigate(`/manager/projects/${projectId}`)}
          >
            <FiArrowLeft /> Back to Project
          </button>
          <div className="header-info">
            <h1>
              <FiFolder className="header-icon" />
              Activity Log
            </h1>
            <p className="project-name">{project?.name}</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ActivityLog 
            projectId={parseInt(projectId)}
            showStats={true}
            showTimeline={true}
            title="Project Activity"
          />
        </motion.div>
      </div>
    </Layout>
  );
};

export default ProjectActivityLog;