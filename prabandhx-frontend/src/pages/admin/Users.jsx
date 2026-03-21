import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUserPlus, FiSearch, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import './Admin.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form states
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    organizationName: '',
    organizationId: 1
  });

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: '',
    organizationName: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll();
      setUsers(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Handle Add User button click
  const handleAddUserClick = () => {
    setShowAddModal(true);
  };

  // Handle Edit button click
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role?.replace('ROLE_', '') || 'USER',
      organizationName: user.organizationName || user.organization?.name || ''
    });
    setShowEditModal(true);
  };

  // Handle Delete button click
  const handleDeleteClick = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.delete(userId);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  // Handle Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      
      if (response.ok) {
        toast.success('User created successfully');
        setShowAddModal(false);
        setUserForm({
          name: '',
          email: '',
          password: '',
          role: 'USER',
          organizationName: '',
          organizationId: 1
        });
        fetchUsers();
      } else {
        const error = await response.text();
        toast.error(`Failed to create user: ${error}`);
      }
    } catch (error) {
      toast.error('Failed to create user');
    }
  };

  // Handle Update User
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    try {
      // Update role if changed
      if (editForm.role !== selectedUser.role?.replace('ROLE_', '')) {
        await userService.updateRole(selectedUser.id, editForm.role);
      }
      
      // You can add more update logic here for name/email if your API supports it
      
      toast.success('User updated successfully');
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const getCleanRole = (role) => {
    if (!role) return 'USER';
    return role.replace('ROLE_', '');
  };

  const getRoleBadgeClass = (role) => {
    const cleanRole = getCleanRole(role);
    switch(cleanRole) {
      case 'ADMIN': return 'role-badge admin';
      case 'MANAGER': return 'role-badge manager';
      default: return 'role-badge user';
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-dashboard">
        <div className="page-header">
          <h1>User Management</h1>
          <div className="header-actions">
            <div className="search-bar">
              <FiSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className="quick-action-btn" 
              onClick={handleAddUserClick}
              style={{ width: 'auto' }}
            >
              <FiUserPlus /> Add User
            </button>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>No users found</h3>
            <p>{searchTerm ? 'Try a different search term' : 'Get started by adding your first user'}</p>
            {!searchTerm && (
              <button className="quick-action-btn" onClick={handleAddUserClick}>
                <FiUserPlus /> Add User
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Organization</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td>#{user.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="activity-avatar" style={{ 
                          width: '35px', 
                          height: '35px', 
                          fontSize: '1rem',
                          background: `linear-gradient(135deg, ${user.role === 'ADMIN' ? '#ef444420' : '#10b98120'}, ${user.role === 'ADMIN' ? '#ef444440' : '#10b98140'})`,
                          color: user.role === 'ADMIN' ? '#ef4444' : '#10b981'
                        }}>
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <strong>{user.name}</strong>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={getRoleBadgeClass(user.role)}>
                        {getCleanRole(user.role)}
                      </span>
                    </td>
                    <td>{user.organizationName || user.organization?.name || 'N/A'}</td>
                    <td>
                      <button 
                        className="action-btn edit"
                        onClick={() => handleEditClick(user)}
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDeleteClick(user.id)}
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add User Modal */}
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create New User">
          <form onSubmit={handleCreateUser}>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                className="form-control"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                required
                placeholder="Enter full name"
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                className="form-control"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                required
                placeholder="Enter email address"
              />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                className="form-control"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                required
                placeholder="Enter password"
                minLength="6"
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                className="form-control"
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              >
                <option value="USER">User</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Organization Name</label>
              <input
                type="text"
                className="form-control"
                value={userForm.organizationName}
                onChange={(e) => setUserForm({ ...userForm, organizationName: e.target.value })}
                placeholder="Enter organization name"
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Create User
            </button>
          </form>
        </Modal>

        {/* Edit User Modal */}
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit User">
          {selectedUser && (
            <form onSubmit={handleUpdateUser}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="User name"
                  readOnly
                  style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
                />
                <small style={{ color: '#64748b' }}>Name cannot be edited</small>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="Email address"
                  readOnly
                  style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
                />
                <small style={{ color: '#64748b' }}>Email cannot be edited</small>
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  className="form-control"
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                >
                  <option value="USER">User</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Organization</label>
                <input
                  type="text"
                  className="form-control"
                  value={editForm.organizationName}
                  onChange={(e) => setEditForm({ ...editForm, organizationName: e.target.value })}
                  placeholder="Organization name"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <FiSave /> Update User
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setShowEditModal(false)}
                  style={{ flex: 1 }}
                >
                  <FiX /> Cancel
                </button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default Users;