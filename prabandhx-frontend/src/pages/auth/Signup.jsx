import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER', // Default role
    organizationName: '',
    organizationId: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setFormData({
      ...formData,
      role: selectedRole,
      // Clear the other field when role changes
      organizationName: '',
      organizationId: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate organization fields
    if (formData.role === 'ADMIN' && !formData.organizationName.trim()) {
      toast.error('Organization name is required for Admin registration');
      setLoading(false);
      return;
    }

    if ((formData.role === 'MANAGER' || formData.role === 'USER') && !formData.organizationId) {
      toast.error('Organization ID is required');
      setLoading(false);
      return;
    }

    // Prepare data based on role
    const submitData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role
    };

    // Add role-specific field
    if (formData.role === 'ADMIN') {
      submitData.organizationName = formData.organizationName;
    } else {
      submitData.organizationId = formData.organizationId;
    }

    try {
      const response = await authService.register(submitData);
      
      if (response.data) {
        toast.success('Registration successful! Please login.');
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific error messages
      const errorMessage = error.response?.data || error.message;
      
      if (errorMessage.includes('not authorized for admin registration') || 
          errorMessage === 'Invalid credentials') {
        toast.error('This email is not authorized for Admin registration');
      } else if (errorMessage.includes('Email already exists')) {
        toast.error('Email already registered. Please use a different email or login.');
      } else {
        toast.error(errorMessage || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              minLength="6"
            />
          </div>

          {/* Role Selection */}
          <div className="form-group">
            <label>Select Role *</label>
            <select
              name="role"
              className="form-control"
              value={formData.role}
              onChange={handleRoleChange}
              required
            >
              <option value="USER">User</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
            {formData.role === 'ADMIN' && (
              <small style={{ color: 'var(--text-light)', display: 'block', marginTop: '5px' }}>
                Note: Only specific email addresses can register as Admin
              </small>
            )}
          </div>

          {/* Dynamic Field based on Role */}
          {formData.role === 'ADMIN' ? (
            <div className="form-group">
              <label>Organization Name *</label>
              <input
                type="text"
                name="organizationName"
                className="form-control"
                value={formData.organizationName}
                onChange={handleChange}
                required={formData.role === 'ADMIN'}
                placeholder="Enter organization name"
              />
              <small style={{ color: 'var(--text-light)' }}>
                As an Admin, you need to create a new organization
              </small>
            </div>
          ) : (
            <div className="form-group">
              <label>Organization ID *</label>
              <input
                type="number"
                name="organizationId"
                className="form-control"
                value={formData.organizationId}
                onChange={handleChange}
                required={formData.role === 'MANAGER' || formData.role === 'USER'}
                placeholder="Enter organization ID"
              />
              <small style={{ color: 'var(--text-light)' }}>
                Enter the Organization ID you received from your Admin
              </small>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn btn-primary w-100" 
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center mt-4">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;