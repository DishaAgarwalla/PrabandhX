import { useState } from 'react';
import { FiSearch, FiFilter, FiX, FiCalendar } from 'react-icons/fi';

const ActivityFilter = ({ onFilter, onSearch, onDateRange, initialValues = {} }) => {
  const [searchTerm, setSearchTerm] = useState(initialValues.search || '');
  const [actionType, setActionType] = useState(initialValues.actionType || 'all');
  const [dateRange, setDateRange] = useState(initialValues.dateRange || 'week');
  const [showFilters, setShowFilters] = useState(false);

  const actionTypes = [
    { value: 'all', label: 'All Actions' },
    { value: 'create', label: '📁 Created' },
    { value: 'update', label: '✏️ Updated' },
    { value: 'delete', label: '🗑️ Deleted' },
    { value: 'upload', label: '📤 Uploaded' },
    { value: 'download', label: '📥 Downloaded' },
    { value: 'login', label: '🔐 Logins' },
    { value: 'invite', label: '📧 Invitations' }
  ];

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'all', label: 'All Time' }
  ];

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) onSearch(value);
  };

  const handleActionTypeChange = (e) => {
    const value = e.target.value;
    setActionType(value);
    if (onFilter) onFilter('actionType', value);
  };

  const handleDateRangeChange = (e) => {
    const value = e.target.value;
    setDateRange(value);
    if (onDateRange) onDateRange(value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setActionType('all');
    setDateRange('week');
    if (onSearch) onSearch('');
    if (onFilter) onFilter('actionType', 'all');
    if (onDateRange) onDateRange('week');
  };

  return (
    <div className="activity-filter-container">
      <div className="filter-search">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by user, action, or details..."
            value={searchTerm}
            onChange={handleSearch}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => handleSearch({ target: { value: '' } })}>
              <FiX />
            </button>
          )}
        </div>
        
        <button 
          className={`filter-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FiFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {showFilters && (
        <div className="filter-options">
          <div className="filter-group">
            <label>Action Type</label>
            <select value={actionType} onChange={handleActionTypeChange}>
              {actionTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Date Range</label>
            <select value={dateRange} onChange={handleDateRangeChange}>
              {dateRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>

          {(searchTerm || actionType !== 'all' || dateRange !== 'week') && (
            <button className="clear-filters" onClick={handleClearFilters}>
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityFilter;
