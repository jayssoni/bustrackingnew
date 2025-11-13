import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Bus, AlertCircle, ArrowLeft, Shield, Navigation, User } from 'lucide-react'

const roleConfig = {
  admin: {
    name: 'Admin',
    icon: Shield,
    color: 'purple',
    description: 'Manage buses, routes, and drivers',
    gradient: 'from-purple-500 to-purple-600',
    bgGradient: 'from-purple-50 to-purple-100'
  },
  driver: {
    name: 'Driver',
    icon: Navigation,
    color: 'green',
    description: 'Update location and manage trips',
    gradient: 'from-green-500 to-green-600',
    bgGradient: 'from-green-50 to-green-100'
  },
  user: {
    name: 'Customer',
    icon: User,
    color: 'blue',
    description: 'Track buses and view routes',
    gradient: 'from-blue-500 to-blue-600',
    bgGradient: 'from-blue-50 to-blue-100'
  }
}

export default function Login({ role = null }) {
  const [searchParams] = useSearchParams()
  const selectedRole = role || searchParams.get('role') || null
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const roleInfo = selectedRole ? roleConfig[selectedRole] : null
  const RoleIcon = roleInfo?.icon || Bus

  useEffect(() => {
    // If no role selected via prop or query param, redirect to role selection
    if (!selectedRole && !role) {
      navigate('/role-selection', { replace: true })
    }
  }, [selectedRole, role, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password, selectedRole)
    
    if (result.success) {
      const user = JSON.parse(localStorage.getItem('user'))
      // Verify role matches selected role
      if (selectedRole && user.role !== selectedRole) {
        setError(`Please login with a ${selectedRole} account`)
        setLoading(false)
        return
      }
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/dashboard/admin', { replace: true })
      } else if (user.role === 'driver') {
        navigate('/dashboard/driver', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } else {
      setError(result.error || 'Login failed')
    }
    
    setLoading(false)
  }

  if (!selectedRole) {
    return null // Will redirect via useEffect
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${roleInfo.bgGradient} px-4 py-12`}>
      <div className="max-w-md w-full">
        <div className="card">
          {/* Back Button */}
          <button
            onClick={() => navigate('/role-selection')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Role Selection</span>
          </button>

          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              roleInfo.color === 'blue' ? 'bg-blue-100' :
              roleInfo.color === 'green' ? 'bg-green-100' :
              'bg-purple-100'
            }`}>
              <RoleIcon className={`h-8 w-8 ${
                roleInfo.color === 'blue' ? 'text-blue-600' :
                roleInfo.color === 'green' ? 'text-green-600' :
                'text-purple-600'
              }`} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600 mt-2">{roleInfo.name} Login</p>
            <p className="text-sm text-gray-500 mt-1">{roleInfo.description}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r ${roleInfo.gradient} hover:opacity-90 text-white font-medium py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'Signing in...' : `Sign In as ${roleInfo.name}`}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => navigate(`/${selectedRole}/register`)}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign up
              </button>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-2">Demo Credentials for {roleInfo.name}:</p>
            <div className="text-xs text-gray-600 space-y-1 text-center">
              {selectedRole === 'admin' && <p><strong>Email:</strong> admin@transport.com<br /><strong>Password:</strong> admin123</p>}
              {selectedRole === 'driver' && <p><strong>Email:</strong> driver@transport.com<br /><strong>Password:</strong> driver123</p>}
              {selectedRole === 'user' && <p><strong>Email:</strong> user@transport.com<br /><strong>Password:</strong> user123</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

