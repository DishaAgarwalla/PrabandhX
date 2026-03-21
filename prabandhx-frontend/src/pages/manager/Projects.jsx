import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { projectService } from '../../services/projectService';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import { FiUsers, FiEye } from 'react-icons/fi'; // Added icons

const ManagerProjects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    console.log('📡 Fetching manager projects...');
    try {
      const response = await projectService.getAll();
      console.log('✅ Projects fetched:', response.data);
      
      // Handle paginated response
      const projectsData = response.data?.content || response.data || [];
      
      // Fetch collaborator counts for each project (optional, can be done in backend)
      const projectsWithStats = await Promise.all(
        projectsData.map(async (project) => {
          try {
            const collaborators = await projectService.getProjectCollaborators(project.id);
            return {
              ...project,
              collaboratorCount: collaborators.data?.length || 0
            };
          } catch (error) {
            return {
              ...project,
              collaboratorCount: 0
            };
          }
        })
      );
      
      setProjects(projectsWithStats);
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await projectService.create(formData);
      toast.success('Project created successfully');
      setShowModal(false);
      setFormData({ name: '', description: '', status: 'ACTIVE' });
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'ACTIVE': return 'badge success';
      case 'COMPLETED': return 'badge info';
      case 'ON_HOLD': return 'badge warning';
      default: return 'badge';
    }
  };

  const handleViewTasks = (projectId) => {
    navigate(`/manager/tasks?projectId=${projectId}`);
  };

  const handleViewCollaborators = (projectId) => {
    navigate(`/manager/projects/${projectId}/collaborators`);
  };

  if (loading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ padding: '20px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '30px' 
        }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '5px' }}>Projects</h1>
            <p style={{ color: '#666' }}>Manage your projects and team collaborators</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-light)' }}>No projects found</p>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowModal(true)}
              style={{ marginTop: '20px' }}
            >
              Create your first project
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="projects-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Collaborators</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <strong>{project.name}</strong>
                    </td>
                    <td>{project.description || 'No description'}</td>
                    <td>
                      <span className={getStatusBadgeClass(project.status)}>
                        {project.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FiUsers style={{ color: '#666' }} />
                        <span>{project.collaboratorCount || 0} members</span>
                      </div>
                    </td>
                    <td>
                      {project.createdAt 
                        ? new Date(project.createdAt).toLocaleDateString() 
                        : 'N/A'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
                          onClick={() => handleViewTasks(project.id)}
                          title="View Tasks"
                        >
                          <FiEye /> Tasks
                        </button>
                        <button 
                          className="btn btn-outline" 
                          style={{ 
                            padding: '5px 10px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '5px',
                            background: '#e3f2fd',
                            borderColor: '#2196f3',
                            color: '#2196f3'
                          }}
                          onClick={() => handleViewCollaborators(project.id)}
                          title="Manage Collaborators"
                        >
                          <FiUsers /> Collaborators
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Project Modal */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Project">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Project Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter project name"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-control"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Enter project description"
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
      </div>
    </Layout>
  );
};

export default ManagerProjects;