import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlusCircle, FiSearch, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import { projectService } from '../../services/projectService';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import './Admin.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Form states
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    status: 'ACTIVE'
  });

  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    status: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectService.getAll();
      const projectsData = response.data?.content || response.data || [];
      setProjects(projectsData);
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  // Handle Add Project button click
  const handleAddClick = () => {
    setShowAddModal(true);
  };

  // Handle Edit button click
  const handleEditClick = (project) => {
    setSelectedProject(project);
    setEditForm({
      name: project.name || '',
      description: project.description || '',
      status: project.status || 'ACTIVE'
    });
    setShowEditModal(true);
  };

  // Handle Delete button click
  const handleDeleteClick = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.delete(projectId);
        toast.success('Project deleted successfully');
        fetchProjects();
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  // Handle Create Project
  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await projectService.create(projectForm);
      toast.success('Project created successfully');
      setShowAddModal(false);
      setProjectForm({ name: '', description: '', status: 'ACTIVE' });
      fetchProjects();
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  // Handle Update Project
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    
    try {
      await projectService.update(selectedProject.id, editForm);
      toast.success('Project updated successfully');
      setShowEditModal(false);
      fetchProjects();
    } catch (error) {
      toast.error('Failed to update project');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'ACTIVE': return 'status-badge active';
      case 'COMPLETED': return 'status-badge completed';
      case 'ON_HOLD': return 'status-badge onhold';
      default: return 'status-badge';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ACTIVE': return '#10b981';
      case 'COMPLETED': return '#3b82f6';
      case 'ON_HOLD': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const filteredProjects = projects.filter(project => 
    project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1>Projects</h1>
          <div className="header-actions">
            <div className="search-bar">
              <FiSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className="quick-action-btn" 
              onClick={handleAddClick}
              style={{ width: 'auto' }}
            >
              <FiPlusCircle /> New Project
            </button>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📁</div>
            <h3>No projects found</h3>
            <p>{searchTerm ? 'Try a different search term' : 'Create your first project to get started'}</p>
            {!searchTerm && (
              <button className="quick-action-btn" onClick={handleAddClick}>
                <FiPlusCircle /> Create Project
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="projects-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Project Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project, index) => (
                  <motion.tr
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td>#{project.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="project-avatar" style={{ 
                          width: '35px', 
                          height: '35px', 
                          borderRadius: '10px',
                          background: `linear-gradient(135deg, ${getStatusColor(project.status)}20, ${getStatusColor(project.status)}40)`,
                          color: getStatusColor(project.status),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem'
                        }}>
                          {project.name?.charAt(0) || 'P'}
                        </div>
                        <strong>{project.name}</strong>
                      </div>
                    </td>
                    <td>{project.description || 'No description'}</td>
                    <td>
                      <span className={getStatusBadge(project.status)}>
                        {project.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td>
                      {project.createdAt 
                        ? new Date(project.createdAt).toLocaleDateString() 
                        : 'N/A'}
                    </td>
                    <td>
                      <button 
                        className="action-btn edit"
                        onClick={() => handleEditClick(project)}
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDeleteClick(project.id)}
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

        {/* Add Project Modal */}
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create New Project">
          <form onSubmit={handleCreateProject}>
            <div className="form-group">
              <label>Project Name *</label>
              <input
                type="text"
                className="form-control"
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                required
                placeholder="Enter project name"
              />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea
                className="form-control"
                rows="3"
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                required
                placeholder="Enter project description"
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                className="form-control"
                value={projectForm.status}
                onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Create Project
            </button>
          </form>
        </Modal>

        {/* Edit Project Modal */}
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Project">
          {selectedProject && (
            <form onSubmit={handleUpdateProject}>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                  placeholder="Enter project name"
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  required
                  placeholder="Enter project description"
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  className="form-control"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <FiSave /> Update Project
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

export default Projects;