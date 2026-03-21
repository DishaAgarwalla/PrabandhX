import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUserPlus, FiSearch, FiFilter } from 'react-icons/fi';
import CollaboratorCard from './CollaboratorCard';
import InviteModal from './InviteModal';
import './Collaborators.css';

const CollaboratorList = ({ projectId, projectName, collaborators = [], onCollaboratorUpdate }) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [localCollaborators, setLocalCollaborators] = useState([]);

  // Update local collaborators when props change
  useEffect(() => {
    console.log('📋 Collaborators received:', collaborators);
    
    // Ensure collaborators is an array and filter out inactive ones
    const safeCollaborators = Array.isArray(collaborators) ? collaborators : [];
    
    // Filter out inactive collaborators (soft deleted)
    const activeCollaborators = safeCollaborators.filter(c => c?.isActive !== false);
    
    console.log('📋 Active collaborators:', activeCollaborators);
    setLocalCollaborators(activeCollaborators);
  }, [collaborators]);

  // Filter collaborators with safety checks
  const filteredCollaborators = localCollaborators.filter(collab => {
    // Skip if collab is null or undefined
    if (!collab) return false;

    // Skip inactive collaborators
    if (collab.isActive === false) return false;

    // Safety checks for string properties
    const email = collab.email || '';
    const invitedByName = collab.invitedByName || '';
    
    // Search filter (case insensitive)
    const searchTermLower = searchTerm.toLowerCase().trim();
    const matchesSearch = searchTerm === '' || 
      email.toLowerCase().includes(searchTermLower) ||
      invitedByName.toLowerCase().includes(searchTermLower);

    // Status filter
    let matchesStatus = true;
    if (filterStatus === 'pending') {
      matchesStatus = !collab.isAccepted;
    } else if (filterStatus === 'active') {
      matchesStatus = collab.isAccepted && !collab.isExpired;
    } else if (filterStatus === 'expired') {
      matchesStatus = collab.isExpired === true;
    }

    return matchesSearch && matchesStatus;
  });

  // Calculate stats (only from active collaborators)
  const stats = {
    total: localCollaborators.length,
    active: localCollaborators.filter(c => c?.isAccepted && !c?.isExpired).length,
    pending: localCollaborators.filter(c => !c?.isAccepted).length,
    expired: localCollaborators.filter(c => c?.isExpired).length
  };

  const handleInviteSuccess = (newCollaborator) => {
    if (onCollaboratorUpdate) {
      const updatedList = [...localCollaborators, newCollaborator];
      setLocalCollaborators(updatedList);
      onCollaboratorUpdate(updatedList);
    }
  };

  const handleUpdateCollaborator = (updatedCollaborator) => {
    if (onCollaboratorUpdate) {
      const updatedList = localCollaborators.map(c => 
        c.id === updatedCollaborator.id ? updatedCollaborator : c
      );
      setLocalCollaborators(updatedList);
      onCollaboratorUpdate(updatedList);
    }
  };

  const handleRemoveCollaborator = (collaboratorId) => {
    // Remove from local state immediately
    const updatedList = localCollaborators.filter(c => c.id !== collaboratorId);
    setLocalCollaborators(updatedList);
    
    if (onCollaboratorUpdate) {
      onCollaboratorUpdate(updatedList);
    }
  };

  return (
    <div className="collaborator-list-container">
      <div className="collaborator-header">
        <div className="header-left">
          <h2>Collaborators</h2>
          <div className="stats-badges">
            <span className="stat-badge total">Total: {stats.total}</span>
            <span className="stat-badge active">Active: {stats.active}</span>
            <span className="stat-badge pending">Pending: {stats.pending}</span>
            <span className="stat-badge expired">Expired: {stats.expired}</span>
          </div>
        </div>
        <button
          className="invite-btn"
          onClick={() => setShowInviteModal(true)}
        >
          <FiUserPlus /> Invite Collaborator
        </button>
      </div>

      <div className="filter-section">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by email or inviter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-dropdown">
          <FiFilter className="filter-icon" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {filteredCollaborators.length === 0 ? (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key="empty-state"
          >
            <div className="empty-icon">👥</div>
            <h3>No collaborators found</h3>
            <p>
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'Invite someone to collaborate on this project'}
            </p>
            {!searchTerm && filterStatus === 'all' && localCollaborators.length === 0 && (
              <button
                className="invite-btn"
                onClick={() => setShowInviteModal(true)}
              >
                <FiUserPlus /> Invite Now
              </button>
            )}
          </motion.div>
        ) : (
          <div className="collaborator-grid">
            {filteredCollaborators.map((collaborator) => (
              <CollaboratorCard
                key={collaborator?.id || `temp-${Math.random()}`}
                collaborator={collaborator}
                onUpdate={handleUpdateCollaborator}
                onRemove={handleRemoveCollaborator}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {showInviteModal && (
        <InviteModal
          key="invite-modal"
          projectId={projectId}
          projectName={projectName}
          onClose={() => setShowInviteModal(false)}
          onInviteSuccess={handleInviteSuccess}
        />
      )}
    </div>
  );
};

export default CollaboratorList;