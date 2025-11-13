import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import RoleSelection from './pages/RoleSelection'
import Login from './pages/Login'
import Register from './pages/Register'
import UserDashboard from './pages/UserDashboard'
import DriverDashboard from './pages/DriverDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Layout from './components/Layout'
import PublicLayout from './components/PublicLayout'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/role-selection" replace />
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  
  const getDefaultRoute = (role) => {
    if (role === 'admin') return '/admin'
    if (role === 'driver') return '/driver'
    return '/'
  }
  
  return (
    <Routes>
      {/* Public Customer View */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<UserDashboard isPublic={true} />} />
      </Route>

      {/* Auth Routes */}
      <Route 
        path="/role-selection" 
        element={!user ? <RoleSelection /> : <Navigate to={getDefaultRoute(user?.role)} replace />} 
      />
      <Route 
        path="/driver/login" 
        element={!user ? <Login role="driver" /> : <Navigate to={getDefaultRoute(user?.role)} replace />} 
      />
      <Route 
        path="/admin/login" 
        element={!user ? <Login role="admin" /> : <Navigate to={getDefaultRoute(user?.role)} replace />} 
      />
      <Route 
        path="/driver/register" 
        element={!user ? <Register role="driver" /> : <Navigate to={getDefaultRoute(user?.role)} replace />} 
      />
      <Route 
        path="/admin/register" 
        element={!user ? <Register role="admin" /> : <Navigate to={getDefaultRoute(user?.role)} replace />} 
      />
      
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route
          path="driver"
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Route>
      
      {/* Redirects for backward compatibility */}
      <Route path="/driver" element={user?.role === 'driver' ? <Navigate to="/dashboard/driver" /> : <Navigate to="/driver/login" />} />
      <Route path="/admin" element={user?.role === 'admin' ? <Navigate to="/dashboard/admin" /> : <Navigate to="/admin/login" />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App

