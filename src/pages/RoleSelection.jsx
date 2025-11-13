import { useNavigate } from 'react-router-dom'
import { Bus, Shield, User, Navigation } from 'lucide-react'

export default function RoleSelection() {
  const navigate = useNavigate()

  const roles = [
    {
      id: 'user',
      name: 'Customer',
      description: 'Track buses, view routes, and get real-time arrival times',
      icon: User,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100'
    },
    {
      id: 'driver',
      name: 'Driver',
      description: 'Update location, manage trips, and track your routes',
      icon: Navigation,
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100'
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Manage buses, routes, drivers, and view analytics',
      icon: Shield,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100'
    }
  ]

  const handleRoleSelect = (roleId) => {
    navigate(`/login?role=${roleId}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 px-4 py-12">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
            <Bus className="h-10 w-10 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome to Transport Tracker</h1>
          <p className="text-xl text-gray-600">Please select your role to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon
            const getColorClasses = (color) => {
              if (color === 'blue') {
                return {
                  border: 'hover:border-blue-300',
                  iconBg: 'bg-blue-100',
                  iconText: 'text-blue-600',
                  titleHover: 'group-hover:text-blue-700',
                  arrow: 'text-blue-600'
                }
              } else if (color === 'green') {
                return {
                  border: 'hover:border-green-300',
                  iconBg: 'bg-green-100',
                  iconText: 'text-green-600',
                  titleHover: 'group-hover:text-green-700',
                  arrow: 'text-green-600'
                }
              } else {
                return {
                  border: 'hover:border-purple-300',
                  iconBg: 'bg-purple-100',
                  iconText: 'text-purple-600',
                  titleHover: 'group-hover:text-purple-700',
                  arrow: 'text-purple-600'
                }
              }
            }
            const colors = getColorClasses(role.color)
            
            return (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent ${colors.border} transform hover:-translate-y-2`}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${role.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                <div className="relative p-8">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${colors.iconBg} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-8 w-8 ${colors.iconText}`} />
                  </div>

                  {/* Content */}
                  <h3 className={`text-2xl font-bold text-gray-900 mb-3 ${colors.titleHover} transition-colors`}>
                    {role.name}
                  </h3>
                  <p className="text-gray-600 text-left mb-6 leading-relaxed">
                    {role.description}
                  </p>

                  {/* Arrow Indicator */}
                  <div className={`flex items-center ${colors.arrow} font-medium group-hover:translate-x-2 transition-transform duration-300`}>
                    <span>Continue</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Hover Effect Border */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${role.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
              </button>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

