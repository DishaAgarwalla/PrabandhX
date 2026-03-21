import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import FileList from '../../components/files/FileList';
import { fileService } from '../../services/fileService';
import { FiUpload, FiDownload, FiStar, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import './UserFiles.css';

const UserFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalStorage: 0,
    totalDownloads: 0
  });

  useEffect(() => {
    fetchFiles();
    fetchStats();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await fileService.getMyFiles();
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
      <div className="user-files-page">
        <div className="page-header">
          <h1>My Files</h1>
          <p>Manage your uploaded files</p>
        </div>

        <div className="stats-grid">
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <FiUpload className="stat-icon" />
            <div className="stat-info">
              <span className="stat-label">My Files</span>
              <span className="stat-value">{stats.totalFiles}</span>
            </div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FiDownload className="stat-icon" />
            <div className="stat-info">
              <span className="stat-label">Downloads</span>
              <span className="stat-value">{stats.totalDownloads}</span>
            </div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <FiStar className="stat-icon" />
            <div className="stat-info">
              <span className="stat-label">Storage Used</span>
              <span className="stat-value">{formatStorage(stats.totalStorage)}</span>
            </div>
          </motion.div>
        </div>

        <div className="storage-info">
          <div className="storage-bar">
            <div 
              className="storage-fill"
              style={{ width: `${Math.min((stats.totalStorage / (100 * 1024 * 1024)) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="storage-text">
            {formatStorage(stats.totalStorage)} used of 100 MB
          </p>
        </div>

        <FileList
          files={files}
          loading={loading}
          onRefresh={fetchFiles}
          onDelete={handleDelete}
          onVersionUpdate={handleVersionUpdate}
          showUpload={true}
          title="My Uploads"
        />

        {files.length === 0 && (
          <motion.div
            className="upload-tip"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <FiZap className="tip-icon" />
            <div className="tip-content">
              <h4>Upload your first file</h4>
              <p>Drag and drop files or click the upload area above</p>
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default UserFiles;