import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiActivity, 
  FiRefreshCw, 
  FiTrash2, 
  FiSearch,
  FiFilter,
  FiX,
  FiUser,
  FiGlobe,
  FiClock
} from 'react-icons/fi';
import ActivityItem from './ActivityItem';
import ActivityFilter from './ActivityFilter';
import ActivityStats from './ActivityStats';
import ActivityTimeline from './ActivityTimeline';
import { activityLogService } from '../../services/activityLogService';
import './ActivityLog.css';

const ActivityLog = ({ 
  projectId, 
  userId, 
  showStats = true, 
  showTimeline = true,
  title = 'Activity Log'
}) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [filter, setFilter] = useState({ search: '', actionType: 'all', dateRange: 'week' });
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, [projectId, userId]);

  useEffect(() => {
    filterLogs();
  }, [logs, filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let logsResponse;
      if (projectId) {
        logsResponse = await activityLogService.getProjectLogs(projectId);
        if (showStats) {
          const statsResponse = await activityLogService.getProjectActivityStats(projectId);
          setStats(statsResponse.data);
        }
      } else if (userId) {
        logsResponse = await activityLogService.getUserLogs(userId);
      } else {
        logsResponse = await activityLogService.getRecentLogs();
        if (showStats) {
          const statsResponse = await activityLogService.getActivityStats();
          setStats(statsResponse.data);
          setTimeline(statsResponse.data.timeline);
        }
      }

      const logsData = logsResponse?.data;
      let logsArray = [];
      
      if (Array.isArray(logsData)) {
        logsArray = logsData;
      } else if (logsData && typeof logsData === 'object' && Array.isArray(logsData.logs)) {
        logsArray = logsData.logs;
      } else if (logsData && typeof logsData === 'object' && Array.isArray(logsData.content)) {
        logsArray = logsData.content;
      }
      
      setLogs(logsArray);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = Array.isArray(logs) ? [...logs] : [];

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.userName?.toLowerCase().includes(searchLower) ||
        log.userEmail?.toLowerCase().includes(searchLower) ||
        log.action?.toLowerCase().includes(searchLower) ||
        log.details?.toLowerCase().includes(searchLower)
      );
    }

    if (filter.actionType !== 'all') {
      filtered = filtered.filter(log => 
        log.actionType?.toLowerCase() === filter.actionType.toLowerCase()
      );
    }

    if (filter.dateRange !== 'all') {
      const now = new Date();
      let startDate;
      switch (filter.dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setDate(now.getDate() - 30));
          break;
        default:
          startDate = null;
      }
      if (startDate) {
        filtered = filtered.filter(log => new Date(log.timestamp) >= startDate);
      }
    }

    setFilteredLogs(filtered);
  };

  const handleRefresh = () => {
    fetchData();
  };

  // ✅ FIXED: Clean Old Logs function
  const handleCleanOldLogs = async () => {
    if (window.confirm('⚠️ Are you sure you want to delete logs older than 30 days? This action cannot be undone.')) {
      try {
        setLoading(true);
        // ✅ CORRECT method name from your service
        const response = await activityLogService.cleanupOldLogs(30);
        console.log('Cleanup response:', response);
        
        // Show success message with deleted count
        const deletedCount = response.data?.deletedCount || response.data?.data?.deletedCount || 0;
        alert(`✅ Successfully deleted ${deletedCount} old log entries!`);
        
        // Refresh the logs
        await fetchData();
      } catch (error) {
        console.error('Error cleaning logs:', error);
        alert('❌ Failed to clean old logs. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSearch = (term) => {
    setFilter(prev => ({ ...prev, search: term }));
  };

  const handleActionTypeFilter = (type) => {
    setFilter(prev => ({ ...prev, actionType: type }));
  };

  const handleDateRangeFilter = (range) => {
    setFilter(prev => ({ ...prev, dateRange: range }));
  };

  const handleClearFilters = () => {
    setFilter({ search: '', actionType: 'all', dateRange: 'week' });
    setShowFilters(false);
  };

  const todayCount = Array.isArray(filteredLogs) ? filteredLogs.filter(l => {
    const today = new Date().toDateString();
    return new Date(l.timestamp).toDateString() === today;
  }).length : 0;

  const uniqueUsers = new Set(Array.isArray(logs) ? logs.map(l => l.userEmail) : []).size;

  if (loading) {
    return (
      <div className="activity-log-container">
        <div className="activity-loading">
          <div className="spinner"></div>
          <p>Loading activity log...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-log-container">
      {/* Header */}
      <div className="activity-log-header">
        <h2>
          <FiActivity className="header-icon" />
          {title}
        </h2>
        <div className="activity-stats">
          <span className="stat-badge today">
            <FiClock size={12} /> Today: {todayCount}
          </span>
          <span className="stat-badge total">
            Total: {Array.isArray(logs) ? logs.length : 0}
          </span>
          <span className="stat-badge">
            <FiUser size={12} /> Users: {uniqueUsers}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="refresh-btn" onClick={handleRefresh}>
            <FiRefreshCw /> Refresh
          </button>
          <button className="refresh-btn" onClick={handleCleanOldLogs} style={{ color: '#dc2626' }}>
            <FiTrash2 /> Clean Old Logs
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {showStats && stats && (
        <ActivityStats stats={stats} />
      )}

      {/* Timeline */}
      {showTimeline && timeline && timeline.length > 0 && (
        <ActivityTimeline timeline={timeline} />
      )}

      {/* Search and Filters */}
      <div className="filter-container">
        <div className="search-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by user, action, or details..."
            value={filter.search}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {filter.search && (
            <button 
              className="clear-search" 
              onClick={() => handleSearch('')}
              style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <FiX />
            </button>
          )}
        </div>
        
        <div className="filter-buttons">
          <button 
            className={`filter-chip ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter /> Filters
          </button>
          <button 
            className={`filter-chip ${filter.actionType === 'all' ? 'active' : ''}`}
            onClick={() => handleActionTypeFilter('all')}
          >
            All Actions
          </button>
          <button 
            className={`filter-chip ${filter.actionType === 'create' ? 'active' : ''}`}
            onClick={() => handleActionTypeFilter('create')}
          >
            Created
          </button>
          <button 
            className={`filter-chip ${filter.actionType === 'update' ? 'active' : ''}`}
            onClick={() => handleActionTypeFilter('update')}
          >
            Updated
          </button>
          <button 
            className={`filter-chip ${filter.actionType === 'delete' ? 'active' : ''}`}
            onClick={() => handleActionTypeFilter('delete')}
          >
            Deleted
          </button>
          <button 
            className={`filter-chip ${filter.actionType === 'login' ? 'active' : ''}`}
            onClick={() => handleActionTypeFilter('login')}
          >
            Logins
          </button>
          <button 
            className={`filter-chip ${filter.dateRange === 'today' ? 'active' : ''}`}
            onClick={() => handleDateRangeFilter('today')}
          >
            Today
          </button>
          <button 
            className={`filter-chip ${filter.dateRange === 'week' ? 'active' : ''}`}
            onClick={() => handleDateRangeFilter('week')}
          >
            This Week
          </button>
          <button 
            className={`filter-chip ${filter.dateRange === 'month' ? 'active' : ''}`}
            onClick={() => handleDateRangeFilter('month')}
          >
            This Month
          </button>
          {(filter.search || filter.actionType !== 'all' || filter.dateRange !== 'week') && (
            <button className="filter-chip danger" onClick={handleClearFilters}>
              <FiX /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Activity List */}
      <div className="activity-list">
        <AnimatePresence>
          {!Array.isArray(filteredLogs) || filteredLogs.length === 0 ? (
            <div className="activity-empty">
              <div className="empty-icon">📭</div>
              <p>No activity logs found</p>
              <p style={{ fontSize: '0.8rem', marginTop: '8px' }}>Try adjusting your filters</p>
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <ActivityItem key={log.id || index} log={log} index={index} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ActivityLog;
