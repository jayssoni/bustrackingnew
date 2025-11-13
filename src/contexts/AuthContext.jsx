import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password, expectedRole = null) => {
    // Mock authentication - in production, this would be an API call
    const mockUsers = {
      'admin@transport.com': { id: 1, email: 'admin@transport.com', name: 'Admin User', role: 'admin', password: 'admin123' },
      'driver@transport.com': { id: 2, email: 'driver@transport.com', name: 'John Driver', role: 'driver', password: 'driver123' },
      'user@transport.com': { id: 3, email: 'user@transport.com', name: 'John Doe', role: 'user', password: 'user123' },
    }

    const user = mockUsers[email]
    
    if (user && user.password === password) {
      // Verify role if expected
      if (expectedRole && user.role !== expectedRole) {
        return { success: false, error: `This account is for ${user.role}s, not ${expectedRole}s` }
      }
      
      const { password: _, ...userWithoutPassword } = user
      setUser(userWithoutPassword)
      localStorage.setItem('user', JSON.stringify(userWithoutPassword))
      return { success: true }
    }
    
    return { success: false, error: 'Invalid credentials' }
  }

  const register = async (name, email, password, role = 'user') => {
    // Mock registration
    const newUser = {
      id: Date.now(),
      email,
      name,
      role,
    }
    
    setUser(newUser)
    localStorage.setItem('user', JSON.stringify(newUser))
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

