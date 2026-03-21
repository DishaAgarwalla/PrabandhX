import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiGrid, FiList, FiRefreshCw } from 'react-icons/fi';
import FileCard from './FileCard';
import FileUpload from './FileUpload';
import './Files.css';

const FileList = ({
  files,
  loading,
  onRefresh,
  onDelete,
  onVersionUpdate,
  showUpload = true,
  projectId,
  taskId,
  title = 'Files'
}) => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filteredFiles, setFilteredFiles] = useState([]);

  useEffect(() => {
    filterFiles();
  }, [files, searchTerm, filterType]);

  const filterFiles = () => {
    let filtered = [...files];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(file =>
        file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(file => 
        file.fileType?.toLowerCase() === filterType.toLowerCase()
      );
    }

    setFilteredFiles(filtered);
  };

  const getFileTypes = () => {
    const types = ['all'];
    files.forEach(file => {
      if (file.fileType && !types.includes(file.fileType)) {
        types.push(file.fileType);
      }
    });
    return types;
  };

  return (
    <div className="file-list-container">
      <div className="file-list-header">
        <div className="header-left">
          <h2>{title}</h2>
          <span className="file-count">{filteredFiles.length} files</span>
        </div>
        <div className="header-actions">
          <button onClick={onRefresh} className="icon-btn" title="Refresh">
            <FiRefreshCw />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`icon-btn ${viewMode === 'grid' ? 'active' : ''}`}
            title="Grid view"
          >
            <FiGrid />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`icon-btn ${viewMode === 'list' ? 'active' : ''}`}
            title="List view"
          >
            <FiList />
          </button>
        </div>
      </div>

      <div className="file-list-filters">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-dropdown">
          <FiFilter className="filter-icon" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            {getFileTypes().map(type => (
              type !== 'all' && (
                <option key={type} value={type}>{type}</option>
              )
            ))}
          </select>
        </div>
      </div>

      {showUpload && (
        <FileUpload
          projectId={projectId}
          taskId={taskId}
          onUploadSuccess={() => onRefresh()}
        />
      )}

      {loading ? (
        <div className="loading-files">
          <div className="spinner"></div>
          <p>Loading files...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="empty-files">
          <div className="empty-icon">📁</div>
          <h3>No files found</h3>
          <p>
            {searchTerm || filterType !== 'all'
              ? 'Try adjusting your filters'
              : 'Upload your first file to get started'}
          </p>
        </div>
      ) : (
        <div className={`files-grid ${viewMode}`}>
          {filteredFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onDelete={onDelete}
              onVersionUpdate={onVersionUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileList;