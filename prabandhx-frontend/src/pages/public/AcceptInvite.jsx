import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiCheck, FiX, FiLoader, FiUsers } from 'react-icons/fi';
import { collaboratorService } from '../../services/collaboratorService';
import toast from 'react-hot-toast';
import './AcceptInvite.css';

const AcceptInvite = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState('enter-email'); // enter-email, processing, success, error

  useEffect(() => {
    // Extract token from URL query parameters
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      validateToken(tokenParam);
    }
  }, [location]);

  const validateToken = async (token) => {
    setLoading(true);
    try {
      await collaboratorService.validateInvitation(token);
      // Token is valid, proceed to email step
      setStep('enter-email');
    } catch (error) {
      console.error('Invalid token:', error);
      setStep('error');
      toast.error('Invalid or expired invitation link');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!token) {
      toast.error('Invalid invitation token');
      return;
    }

    setLoading(true);
    setStep('processing');

    try {
      const response = await collaboratorService.acceptInvitation(token, email);
      
      setStep('success');
      toast.success('Invitation accepted successfully!');
      
      // Store collaborator info in localStorage temporarily
      localStorage.setItem('acceptedInvitation', JSON.stringify(response.data));
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Invitation accepted! Please login to access the project.',
            email: email 
          } 
        });
      }, 3000);
      
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setStep('error');
      toast.error(error.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleSignupRedirect = () => {
    navigate('/signup', { state: { email } });
  };

  return (
    <div className="accept-invite-container">
      <motion.div
        className="accept-invite-card"
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="card-header">
          <div className="header-icon">
            <FiUsers />
          </div>
          <h1>Project Invitation</h1>
          <p>You've been invited to collaborate on a project</p>
        </div>

        {/* Content */}
        <div className="card-content">
          {step === 'enter-email' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <form onSubmit={handleSubmit} className="email-form">
                <div className="form-group">
                  <label>
                    <FiMail /> Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoFocus
                  />
                  <p className="help-text">
                    Please enter the email address where you received this invitation.
                  </p>
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FiLoader className="spin" /> Processing...
                    </>
                  ) : (
                    'Accept Invitation'
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              className="processing-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FiLoader className="spin large" />
              <h3>Processing your invitation...</h3>
              <p>Please wait while we set up your access.</p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              className="success-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="success-icon">
                <FiCheck />
              </div>
              <h3>Invitation Accepted!</h3>
              <p>You now have access to the project.</p>
              <p className="redirect-message">
                Redirecting you to login...
              </p>
              <div className="action-buttons">
                <button
                  onClick={handleLoginRedirect}
                  className="btn-primary"
                >
                  Go to Login Now
                </button>
              </div>
            </motion.div>
          )}

          {step === 'error' && (
            <motion.div
              className="error-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="error-icon">
                <FiX />
              </div>
              <h3>Invalid or Expired Invitation</h3>
              <p>The invitation link you used is no longer valid.</p>
              <p className="error-details">
                This could be because:
                <br />• The link has expired
                <br />• The invitation was already used
                <br />• The invitation was revoked
              </p>
              <div className="action-buttons">
                <button
                  onClick={() => navigate('/')}
                  className="btn-outline"
                >
                  Go to Home
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="btn-primary"
                >
                  Contact Support
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="card-footer">
          <p>
            By accepting this invitation, you agree to our{' '}
            <a href="/terms">Terms of Service</a> and{' '}
            <a href="/privacy">Privacy Policy</a>.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AcceptInvite;