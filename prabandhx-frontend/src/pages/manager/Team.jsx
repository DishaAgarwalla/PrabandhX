import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';

const ManagerTeam = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    console.log('📡 Fetching team members...');
    setError(null);
    
    try {
      const response = await userService.getAll();
      console.log('✅ API Response:', response);
      
      // Handle different response structures
      const users = response.data || [];
      console.log('✅ All users:', users);
      
      // Filter for regular users (not admins/managers)
      const members = users.filter(user => {
        const role = user.role?.replace('ROLE_', '') || user.role;
        return role === 'USER';
      });
      
      console.log('✅ Filtered team members:', members);
      setTeamMembers(members);
      
      if (members.length === 0) {
        toast.success('No team members found. Create some users with role USER.');
      }
      
    } catch (error) {
      console.error('❌ Error fetching team members:', error);
      setError(error.message);
      toast.error('Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div style={{ padding: '20px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '30px' }}>Team Members</h1>
          <div className="card" style={{ textAlign: 'center', padding: '40px', background: '#FEE2E2' }}>
            <p style={{ fontSize: '1.2rem', color: '#991B1B' }}>Failed to fetch team members</p>
            <p style={{ marginTop: '10px', color: '#991B1B' }}>Error: {error}</p>
            <button 
              className="btn btn-primary" 
              onClick={fetchTeamMembers}
              style={{ marginTop: '20px' }}
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ padding: '20px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '30px' }}>Team Members</h1>

        {teamMembers.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-light)' }}>No team members found</p>
            <p style={{ marginTop: '10px', color: 'var(--text-light)' }}>
              Team members are users with role 'USER'
            </p>
          </div>
        ) : (
          <div className="grid-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="card" style={{ textAlign: 'center' }}>
                <div className="user-avatar" style={{ 
                  margin: '0 auto 20px', 
                  width: '80px', 
                  height: '80px', 
                  fontSize: '2rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}>
                  {member.name?.charAt(0) || 'U'}
                </div>
                <h3 style={{ marginBottom: '10px' }}>{member.name}</h3>
                <p style={{ color: 'var(--text-light)', marginBottom: '5px' }}>{member.email}</p>
                <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>
                  {member.organizationName || member.organization?.name || 'N/A'}
                </p>
                <span className="badge info">Team Member</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManagerTeam;