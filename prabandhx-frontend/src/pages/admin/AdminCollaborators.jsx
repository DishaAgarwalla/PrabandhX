import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import { collaboratorService } from '../../services/collaboratorService';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import { 
  FiUsers, 
  FiSearch, 
  FiFilter,
  FiTrash2,
  FiMail,
  FiCalendar,
  FiClock,
  FiRefreshCw,
  FiUserCheck,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import './AdminCollaborators.css';

const AdminCollaborators = () => {
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    expired: 0
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchCollaborators(), fetchStats()]);
    setLoading(false);
  };

  const fetchCollaborators = async () => {
    try {
      const response = await collaboratorService.getAllCollaborators();
      setCollaborators(response.data || []);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      toast.error('Failed to load collaborators');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await collaboratorService.getCollaboratorStats();
      setStats(response.data || { total: 0, active: 0, pending: 0, expired: 0 });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  const handleDelete = async (collaboratorId, email) => {
    if (window.confirm(`Are you sure you want to delete collaborator ${email}?`)) {
      try {
        await collaboratorService.adminDeleteCollaborator(collaboratorId);
        toast.success('Collaborator deleted successfully');
        fetchAllData();
      } catch (error) {
        toast.error('Failed to delete collaborator');
      }
    }
  };

  const getStatusBadge = (collab) => {
    if (!collab) return null;
    
    if (!collab.isAccepted) {
      return <span className="status-badge pending">Pending</span>;
    }
    if (collab.isExpired) {
      return <span className="status-badge expired">Expired</span>;
    }
    return <span className="status-badge active">Active</span>;
  };

  const getPermissionBadge = (permission) => {
    switch(permission) {
      case 'VIEWER':
        return <span className="permission-badge viewer">Viewer</span>;
      case 'EDITOR':
        return <span className="permission-badge editor">Editor</span>;
      case 'UPLOADER':
        return <span className="permission-badge uploader">Uploader</span>;
      case 'ADMIN':
        return <span className="permission-badge admin">Admin</span>;
      default:
        return <span className="permission-badge default">{permission || 'Unknown'}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Filter collaborators
  const filteredCollaborators = collaborators.filter(c => {
    if (!c) return false;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const emailMatch = c.email?.toLowerCase().includes(searchLower);
      const projectMatch = c.projectName?.toLowerCase().includes(searchLower);
      const inviterMatch = c.invitedByName?.toLowerCase().includes(searchLower);
      if (!emailMatch && !projectMatch && !inviterMatch) return false;
    }
    
    if (filterStatus !== 'all') {
      if (filterStatus === 'pending') return !c.isAccepted;
      if (filterStatus === 'active') return c.isAccepted && !c.isExpired;
      if (filterStatus === 'expired') return c.isExpired === true;
    }
    
    return true;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCollaborators.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCollaborators.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

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
      <div className="admin-collaborators">
        {/* Header with Refresh */}
        <div className="page-header">
          <div className="header-left">
            <h1>
              <FiUsers className="header-icon" />
              Collaborator Management
            </h1>
            <p>Manage all collaborators across all projects</p>
          </div>
          <button 
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FiRefreshCw className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Collaborators</span>
            </div>
          </div>
          
          <div className="stat-card active">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <span className="stat-value">{stats.active}</span>
              <span className="stat-label">Active</span>
            </div>
          </div>
          
          <div className="stat-card pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <span className="stat-value">{stats.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          
          <div className="stat-card expired">
            <div className="stat-icon">⌛</div>
            <div className="stat-content">
              <span className="stat-value">{stats.expired}</span>
              <span className="stat-label">Expired</span>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="filters-section">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by email, project or inviter..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchTerm && (
              <button 
                className="clear-search"
                onClick={() => setSearchTerm('')}
              >
                ×
              </button>
            )}
          </div>
          
          <div className="filter-dropdown">
            <FiFilter className="filter-icon" />
            <select 
              value={filterStatus} 
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="pending">Pending Only</option>
              <option value="expired">Expired Only</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="results-summary">
          <span>
            Showing {currentItems.length} of {filteredCollaborators.length} collaborators
          </span>
          {searchTerm && (
            <span className="search-term">Search: "{searchTerm}"</span>
          )}
        </div>

        {/* Collaborators Table */}
        <div className="table-container">
          {filteredCollaborators.length === 0 ? (
            <div className="empty-state">
              <FiUsers className="empty-icon" />
              <h3>No collaborators found</h3>
              <p>
                {searchTerm 
                  ? `No results matching "${searchTerm}"`
                  : filterStatus !== 'all'
                  ? `No ${filterStatus} collaborators found`
                  : 'No collaborators in the system yet'}
              </p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="collaborators-table">
                  <thead>
                    <tr>
                      <th>Collaborator</th>
                      <th>Project</th>
                      <th>Permission</th>
                      <th>Status</th>
                      <th>Invited By</th>
                      <th>Invited Date</th>
                      <th>Expiry</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((collab) => (
                      <tr key={collab.id} className={collab.isExpired ? 'expired-row' : ''}>
                        <td>
                          <div className="email-cell">
                            <FiMail className="cell-icon" />
                            <span className="email-text" title={collab.email}>
                              {truncateText(collab.email, 25)}
                            </span>
                          </div>
                        </td>
                        
                        <td>
                          <span className="project-name" title={collab.projectName}>
                            {truncateText(collab.projectName, 15) || 'N/A'}
                          </span>
                        </td>
                        
                        <td>
                          {getPermissionBadge(collab.permissionLevel)}
                        </td>
                        
                        <td>
                          {getStatusBadge(collab)}
                        </td>
                        
                        <td>
                          <div className="invited-by" title={collab.invitedByName}>
                            <FiUserCheck className="inviter-icon" />
                            <span className="inviter-name">
                              {truncateText(collab.invitedByName, 8) || 'System'}
                            </span>
                          </div>
                        </td>
                        
                        <td>
                          <div className="date-cell">
                            <FiCalendar className="cell-icon" />
                            <span className="date-text">
                              {formatDate(collab.invitedAt)}
                            </span>
                          </div>
                        </td>
                        
                        <td>
                          {collab.expiresAt ? (
                            <div className={`date-cell ${collab.isExpired ? 'expired' : ''}`}>
                              <FiClock className="cell-icon" />
                              <span className="date-text">
                                {formatDate(collab.expiresAt)}
                              </span>
                            </div>
                          ) : (
                            <span className="never-expires">Never</span>
                          )}
                        </td>
                        
                        <td>
                          <button
                            className="action-btn delete"
                            onClick={() => handleDelete(collab.id, collab.email)}
                            title="Delete Collaborator"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="page-btn"
                    onClick={prevPage}
                    disabled={currentPage === 1}
                  >
                    <FiChevronLeft />
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                      onClick={() => paginate(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button 
                    className="page-btn"
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                  >
                    <FiChevronRight />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Info Note */}
        <div className="info-note">
          <FiAlertCircle className="info-icon" />
          <span>
            <strong>Note:</strong> Deleting a collaborator will permanently remove them from the system.
            This action cannot be undone.
          </span>
        </div>
      </div>
    </Layout>
  );
};

export default AdminCollaborators;