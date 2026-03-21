import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    console.log('================ LOGIN DEBUG ================');
    console.log('1️⃣ Login started for email:', email);
    
    try {
      console.log('2️⃣ Calling login function...');
      const result = await login(email, password);
      console.log('3️⃣ Login function returned:', result);
      
      if (result.success) {
        console.log('4️⃣ SUCCESS! Role received:', result.role);
        toast.success('Login successful!');
        
        // Check if role exists
        if (!result.role) {
          console.error('5️⃣ NO ROLE IN RESULT!');
          toast.error('No role received from server');
          setLoading(false);
          return;
        }
        
        console.log('5️⃣ Role is:', result.role);
        console.log('6️⃣ Attempting redirect...');
        
        // METHOD 1: window.location.href (most reliable)
        const roleLower = result.role.toLowerCase();
        const redirectUrl = `/${roleLower}/dashboard`;
        console.log('7️⃣ Redirect URL:', redirectUrl);
        
        // Small delay to show success message
        setTimeout(() => {
          console.log('8️⃣ EXECUTING REDIRECT NOW to:', redirectUrl);
          window.location.href = redirectUrl;
        }, 1500);
        
      } else {
        console.log('4️⃣ LOGIN FAILED:', result.error);
        toast.error(result.error || 'Login failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ CATCH ERROR:', error);
      console.error('❌ Error message:', error.message);
      toast.error('Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary w-100" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-center mt-4">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;