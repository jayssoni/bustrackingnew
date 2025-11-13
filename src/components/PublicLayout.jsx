import { Outlet, useNavigate } from 'react-router-dom'
import { Bus, LogIn, UserPlus } from 'lucide-react'
import { useState } from 'react'

export default function PublicLayout() {
  const navigate = useNavigate()
  const [showDriverMenu, setShowDriverMenu] = useState(false)
  const [showAdminMenu, setShowAdminMenu] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-xl shadow-md">
                <Bus className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Transport Tracker</h1>
                <p className="text-xs text-gray-500">Real-time Bus Tracking</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Driver Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowDriverMenu(!showDriverMenu)
                    setShowAdminMenu(false)
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  <span>Driver</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showDriverMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigate('/driver/login')
                          setShowDriverMenu(false)
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-200"
                      >
                        <LogIn className="h-4 w-4 text-green-600" />
                        <span>Login</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/driver/register')
                          setShowDriverMenu(false)
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-200"
                      >
                        <UserPlus className="h-4 w-4 text-green-600" />
                        <span>Register</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowAdminMenu(!showAdminMenu)
                    setShowDriverMenu(false)
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  <span>Admin</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showAdminMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigate('/admin/login')
                          setShowAdminMenu(false)
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 transition-all duration-200"
                      >
                        <LogIn className="h-4 w-4 text-purple-600" />
                        <span>Login</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/admin/register')
                          setShowAdminMenu(false)
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 transition-all duration-200"
                      >
                        <UserPlus className="h-4 w-4 text-purple-600" />
                        <span>Register</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
