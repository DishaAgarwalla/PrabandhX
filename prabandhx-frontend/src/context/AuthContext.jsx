import { createContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===============================
  // CHECK LOGIN ON PAGE REFRESH
  // ===============================
  useEffect(() => {
    console.log('🔵 AuthContext - Initializing...');
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");

    console.log('🔵 AuthContext - localStorage values:', {
      token: token ? '✅ Present' : '❌ Missing',
      storedUser: storedUser ? '✅ Present' : '❌ Missing',
      storedRole: storedRole ? storedRole : '❌ Missing'
    });

    if (token && storedUser) {
      try {
        const decoded = jwtDecode(token);
        console.log('🔵 AuthContext - Decoded token:', decoded);

        const userData = JSON.parse(storedUser);
        setUser(userData);
        setRole(storedRole);
        
        console.log('🔵 AuthContext - User set:', { user: userData, role: storedRole });
      } catch (error) {
        console.error("🔴 AuthContext - Invalid token:", error);
        localStorage.clear();
      }
    } else {
      console.log('🔵 AuthContext - No user found in localStorage');
    }

    setLoading(false);
  }, []);

  // ===============================
  // LOGIN
  // ===============================
  const login = async (email, password) => {
    console.log('🟢 AuthContext - login called with email:', email);
    
    try {
      console.log('🟢 AuthContext - Calling authService.login...');
      const result = await authService.login(email, password);
      console.log('🟢 AuthContext - authService.login returned:', result);

      if (!result.success) {
        console.log('🟢 AuthContext - Login failed:', result.error);
        return result;
      }

      console.log('🟢 AuthContext - Login successful! Raw role:', result.role);

      // IMPORTANT: Remove ROLE_ prefix if present
      let cleanRole = result.role;
      if (cleanRole && cleanRole.startsWith('ROLE_')) {
        cleanRole = cleanRole.replace('ROLE_', '');
        console.log('🟢 AuthContext - Cleaned role from', result.role, 'to', cleanRole);
      }

      console.log('🟢 AuthContext - User data:', result.user);

      // Update state with clean role
      setUser(result.user);
      setRole(cleanRole);

      // Also update localStorage with clean role
      localStorage.setItem('role', cleanRole);

      // Verify localStorage was set
      setTimeout(() => {
        console.log('🟢 AuthContext - VERIFYING localStorage after login:');
        console.log('  token:', localStorage.getItem('token') ? '✅' : '❌');
        console.log('  role:', localStorage.getItem('role'));
        console.log('  user:', localStorage.getItem('user'));
      }, 100);

      return {
        success: true,
        role: cleanRole
      };

    } catch (error) {
      console.error("🟢 AuthContext - Login error:", error);
      return {
        success: false,
        error: "Invalid email or password"
      };
    }
  };

  // ===============================
  // SIGNUP
  // ===============================
  const signup = async (userData) => {
    try {
      const response = await authService.register(userData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error("Signup error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Signup failed"
      };
    }
  };

  // ===============================
  // LOGOUT
  // ===============================
  const logout = () => {
    authService.logout();
    localStorage.clear();
    setUser(null);
    setRole(null);
    console.log('🟢 AuthContext - Logged out, localStorage cleared');
  };

  const value = {
    user,
    role,
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};