import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { Toaster } from 'react-hot-toast';

// Import Home Page
import Home from './pages/Home';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminProjects from './pages/admin/Projects';
import AdminReports from './pages/admin/Reports';
import AdminFiles from './pages/admin/AdminFiles';
import AdminCollaborators from './pages/admin/AdminCollaborators';
import AdminActivityLog from './pages/admin/AdminActivityLog'; // Activity Log for Admin
// GanttPage import REMOVED

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerProjects from './pages/manager/Projects';
import ManagerTasks from './pages/manager/Tasks';
import ManagerTeam from './pages/manager/Team';
import ManagerFiles from './pages/manager/ManagerFiles';
import ProjectCollaborators from './pages/manager/ProjectCollaborators';
import ProjectView from './pages/manager/ProjectView';
import ProjectActivityLog from './pages/manager/ProjectActivityLog'; // Project Activity Log for Manager

// User Pages
import UserDashboard from './pages/user/Dashboard';
import UserTasks from './pages/user/MyTasks';
import UserProfile from './pages/user/Profile';
import UserFiles from './pages/user/UserFiles';
import LeaderboardPage from './pages/user/LeaderboardPage';
import SharedProjects from './pages/user/SharedProjects';
import UserProjectView from './pages/user/UserProjectView';
import MyActivityLog from './pages/user/MyActivityLog'; // My Activity Log for User

// Public Pages (for guest access)
import AcceptInvite from './pages/public/AcceptInvite';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import Layout from './components/layout/Layout';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { role, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div className="spinner"></div>
      </div>
    );
  }
  
  if (!role) {
    return <Navigate to="/login" />;
  }
  
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes with PublicLayout */}
      <Route path="/" element={
        <PublicLayout>
          <Home />
        </PublicLayout>
      } />
      <Route path="/login" element={
        <PublicLayout>
          <Login />
        </PublicLayout>
      } />
      <Route path="/signup" element={
        <PublicLayout>
          <Signup />
        </PublicLayout>
      } />
      
      {/* Public invite acceptance route (no auth required) */}
      <Route path="/accept-invite" element={
        <PublicLayout>
          <AcceptInvite />
        </PublicLayout>
      } />

      {/* Admin Routes with Dashboard Layout */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Layout>
            <AdminDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Layout>
            <AdminUsers />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/projects" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Layout>
            <AdminProjects />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/files" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Layout>
            <AdminFiles />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Layout>
            <AdminReports />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/collaborators" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Layout>
            <AdminCollaborators />
          </Layout>
        </ProtectedRoute>
      } />
      {/* Admin Activity Log Route */}
      <Route path="/admin/activity" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <Layout>
            <AdminActivityLog />
          </Layout>
        </ProtectedRoute>
      } />
      {/* Admin Gantt Chart Route REMOVED */}

      {/* Manager Routes with Dashboard Layout */}
      <Route path="/manager/dashboard" element={
        <ProtectedRoute allowedRoles={['MANAGER']}>
          <Layout>
            <ManagerDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Manager Projects Routes */}
      <Route path="/manager/projects" element={
        <ProtectedRoute allowedRoles={['MANAGER']}>
          <Layout>
            <ManagerProjects />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Manager Project View Route */}
      <Route path="/manager/projects/:projectId" element={
        <ProtectedRoute allowedRoles={['MANAGER']}>
          <Layout>
            <ProjectView />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Project collaborators route */}
      <Route path="/manager/projects/:projectId/collaborators" element={
        <ProtectedRoute allowedRoles={['MANAGER']}>
          <Layout>
            <ProjectCollaborators />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Project Activity Log Route */}
      <Route path="/manager/projects/:projectId/activity" element={
        <ProtectedRoute allowedRoles={['MANAGER']}>
          <Layout>
            <ProjectActivityLog />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/manager/files" element={
        <ProtectedRoute allowedRoles={['MANAGER']}>
          <Layout>
            <ManagerFiles />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/manager/tasks" element={
        <ProtectedRoute allowedRoles={['MANAGER']}>
          <Layout>
            <ManagerTasks />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/manager/team" element={
        <ProtectedRoute allowedRoles={['MANAGER']}>
          <Layout>
            <ManagerTeam />
          </Layout>
        </ProtectedRoute>
      } />
      {/* Manager Gantt Chart Route REMOVED */}

      {/* User Routes with Dashboard Layout */}
      <Route path="/user/dashboard" element={
        <ProtectedRoute allowedRoles={['USER']}>
          <Layout>
            <UserDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/user/tasks" element={
        <ProtectedRoute allowedRoles={['USER']}>
          <Layout>
            <UserTasks />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/user/files" element={
        <ProtectedRoute allowedRoles={['USER']}>
          <Layout>
            <UserFiles />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Shared projects for users */}
      <Route path="/user/shared-projects" element={
        <ProtectedRoute allowedRoles={['USER']}>
          <Layout>
            <SharedProjects />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* User Project View Route */}
      <Route path="/user/projects/:projectId" element={
        <ProtectedRoute allowedRoles={['USER']}>
          <Layout>
            <UserProjectView />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* My Activity Log Route */}
      <Route path="/user/activity" element={
        <ProtectedRoute allowedRoles={['USER']}>
          <Layout>
            <MyActivityLog />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/user/leaderboard" element={
        <ProtectedRoute allowedRoles={['USER']}>
          <Layout>
            <LeaderboardPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/user/profile" element={
        <ProtectedRoute allowedRoles={['USER']}>
          <Layout>
            <UserProfile />
          </Layout>
        </ProtectedRoute>
      } />
      {/* User Gantt Chart Route REMOVED */}

      {/* Catch all unmatched routes - redirect to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '10px',
            },
            success: {
              icon: '🎉',
              style: {
                background: '#10b981',
              },
            },
            error: {
              icon: '❌',
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;