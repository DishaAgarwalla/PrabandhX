import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, 
  FiMail, 
  FiBriefcase, 
  FiLock,
  FiCamera,
  FiArrowLeft,
  FiSave,
  FiKey
} from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import './User.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // profile, security
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    organization: user?.organizationName || user?.organization?.name || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    toast.success('Profile updated successfully!');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password changed successfully!');
  };

  const getInitials = () => {
    if (formData.name) {
      return formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'U';
  };

  return (
    <Layout>
      <div className="user-container">
        {/* Back Button */}
        <button 
          className="user-action-btn outline"
          onClick={() => navigate(-1)}
          style={{ marginBottom: '20px', padding: '10px 20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <FiArrowLeft /> Back
        </button>

        {/* Profile Header */}
        <motion.div 
          className="profile-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'white',
            borderRadius: '30px',
            padding: '40px',
            marginBottom: '30px',
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '200px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            opacity: 0.1,
            zIndex: 0
          }} />
          
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3.5rem',
                fontWeight: '600',
                color: 'white',
                boxShadow: '0 20px 40px -10px #667eea80',
                border: '4px solid white',
                transition: 'all 0.3s ease'
              }}>
                {getInitials()}
              </div>
              <div style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '35px',
                height: '35px',
                background: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                border: '2px solid #667eea',
                color: '#667eea',
                transition: 'all 0.3s ease'
              }}>
                <FiCamera size={18} />
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '5px' }}>
                {formData.name || 'User'}
              </h1>
              <p style={{ color: '#667eea', fontWeight: '500', marginBottom: '10px' }}>
                {user?.role?.replace('ROLE_', '') || 'USER'}
              </p>
              <div style={{ display: 'flex', gap: '20px', color: '#64748b' }}>
                <span><FiMail style={{ marginRight: '5px' }} /> {formData.email}</span>
                <span><FiBriefcase style={{ marginRight: '5px' }} /> {formData.organization || 'No Organization'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <button
            className={`user-action-btn ${activeTab === 'profile' ? '' : 'outline'}`}
            onClick={() => setActiveTab('profile')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FiUser /> Profile Information
          </button>
          <button
            className={`user-action-btn ${activeTab === 'security' ? '' : 'outline'}`}
            onClick={() => setActiveTab('security')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FiLock /> Security
          </button>
        </div>

        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="table-wrapper"
          >
            <h3 style={{ fontSize: '1.3rem', marginBottom: '25px', color: '#1e293b' }}>Profile Information</h3>
            <form onSubmit={handleProfileUpdate}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '25px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>
                    <FiUser style={{ marginRight: '5px' }} /> Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    style={{ padding: '12px 16px', borderRadius: '12px', border: '2px solid #e2e8f0' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>
                    <FiMail style={{ marginRight: '5px' }} /> Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    readOnly
                    style={{ padding: '12px 16px', borderRadius: '12px', border: '2px solid #e2e8f0', background: '#f1f5f9' }}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>
                    <FiBriefcase style={{ marginRight: '5px' }} /> Organization
                  </label>
                  <input
                    type="text"
                    name="organization"
                    className="form-control"
                    value={formData.organization}
                    onChange={handleChange}
                    readOnly
                    style={{ padding: '12px 16px', borderRadius: '12px', border: '2px solid #e2e8f0', background: '#f1f5f9' }}
                  />
                </div>
              </div>
              <button type="submit" className="user-action-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiSave /> Update Profile
              </button>
            </form>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="table-wrapper"
          >
            <h3 style={{ fontSize: '1.3rem', marginBottom: '25px', color: '#1e293b' }}>Change Password</h3>
            <form onSubmit={handlePasswordChange}>
              <div style={{ display: 'grid', gap: '20px', maxWidth: '500px', marginBottom: '25px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>
                    <FiLock style={{ marginRight: '5px' }} /> Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    className="form-control"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    required
                    style={{ padding: '12px 16px', borderRadius: '12px', border: '2px solid #e2e8f0' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>
                    <FiKey style={{ marginRight: '5px' }} /> New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    className="form-control"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    style={{ padding: '12px 16px', borderRadius: '12px', border: '2px solid #e2e8f0' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>
                    <FiKey style={{ marginRight: '5px' }} /> Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    style={{ padding: '12px 16px', borderRadius: '12px', border: '2px solid #e2e8f0' }}
                  />
                </div>
              </div>
              <button type="submit" className="user-action-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiSave /> Change Password
              </button>
            </form>
          </motion.div>
        )}

        {/* Account Info Card */}
        <motion.div 
          className="table-wrapper"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginTop: '30px' }}
        >
          <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', color: '#1e293b' }}>Account Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <p style={{ color: '#64748b', marginBottom: '5px' }}>Role</p>
              <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1e293b' }}>
                {user?.role?.replace('ROLE_', '') || 'USER'}
              </p>
            </div>
            <div>
              <p style={{ color: '#64748b', marginBottom: '5px' }}>Member Since</p>
              <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1e293b' }}>
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div>
              <p style={{ color: '#64748b', marginBottom: '5px' }}>Account Status</p>
              <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#10b981' }}>Active</p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Profile;