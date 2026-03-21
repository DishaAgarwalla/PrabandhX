import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import FileList from '../../components/files/FileList';
import { fileService } from '../../services/fileService';
import { projectService } from '../../services/projectService';
import { FiFolder, FiHardDrive, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import './ManagerFiles.css';

const ManagerFiles = () => {
  const [files, setFiles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalStorage: 0,
    recentUploads: 0
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchFiles();
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const response = await projectService.getAll();
      setProjects(response.data?.content || response.data || []);
    } catch (error) {
      toast.error('Failed to load projects');
    }
  };

  const fetchFiles = async () => {
    setLoading(true);
    try {
      let response;
      if (selectedProject === 'all') {
        // Get all files from all projects (you might need a specific endpoint)
        const allFiles = [];
        for (const project of projects) {
          const res = await fileService.getProjectFiles(project.id);
          allFiles.push(...res.data);
        }
        setFiles(allFiles);
      } else {
        response = await fileService.getProjectFiles(selectedProject);
        setFiles(response.data);
      }

      // Update stats
      const statsRes = await fileService.getFileStats();
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleVersionUpdate = (updatedFile) => {
    setFiles(prev => prev.map(f => 
      f.id === updatedFile.id ? updatedFile : f
    ));
  };

  const formatStorage = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading && !files.length) {
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
      <div className="manager-files-page">
        <div className="page-header">
          <h1>Project Files</h1>
          <p>Manage files for your projects</p>
        </div>

        <div className="stats-grid">
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <FiFolder className="stat-icon" />
            <div className="stat-info">
              <span className="stat-label">Total Files</span>
              <span className="stat-value">{stats.totalFiles}</span>
            </div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FiHardDrive className="stat-icon" />
            <div className="stat-info">
              <span className="stat-label">Storage Used</span>
              <span className="stat-value">{formatStorage(stats.totalStorage)}</span>
            </div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <FiClock className="stat-icon" />
            <div className="stat-info">
              <span className="stat-label">Recent Uploads</span>
              <span className="stat-value">{stats.recentUploads}</span>
            </div>
          </motion.div>
        </div>

        <div className="project-selector">
          <label>Select Project:</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="project-select"
          >
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <FileList
          files={files}
          loading={loading}
          onRefresh={fetchFiles}
          onDelete={handleDelete}
          onVersionUpdate={handleVersionUpdate}
          showUpload={true}
          projectId={selectedProject !== 'all' ? selectedProject : null}
          title={`Files ${selectedProject !== 'all' ? '- ' + projects.find(p => p.id === parseInt(selectedProject))?.name : ''}`}
        />
      </div>
    </Layout>
  );
};

export default ManagerFiles;