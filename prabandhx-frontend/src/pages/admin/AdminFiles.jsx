import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import FileList from '../../components/files/FileList';
import { fileService } from '../../services/fileService';
import { FiFolder, FiHardDrive, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import './AdminFiles.css';

const AdminFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalStorage: 0,
    totalUsers: 0
  });

  useEffect(() => {
    fetchFiles();
    fetchStats();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await fileService.getAllFiles();
      setFiles(response.data);
    } catch (error) {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fileService.getFileStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDelete = async (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    fetchStats();
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
      <div className="admin-files-page">
        <div className="page-header">
          <h1>File Manager</h1>
          <p>Manage all files across the platform</p>
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
            <FiUsers className="stat-icon" />
            <div className="stat-info">
              <span className="stat-label">Active Users</span>
              <span className="stat-value">{stats.totalUsers}</span>
            </div>
          </motion.div>
        </div>

        <FileList
          files={files}
          loading={loading}
          onRefresh={fetchFiles}
          onDelete={handleDelete}
          onVersionUpdate={handleVersionUpdate}
          showUpload={true}
          title="All Files"
        />
      </div>
    </Layout>
  );
};

export default AdminFiles;