import { useState } from 'react'
import { Bus, MapPin, Users, TrendingUp, Plus, Edit, Trash2, Search, Filter } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

const mockBuses = [
  { id: 1, number: 'BUS-001', route: '101', driver: 'John Driver', status: 'active', passengers: 25, capacity: 40 },
  { id: 2, number: 'BUS-002', route: '101', driver: 'Jane Smith', status: 'active', passengers: 18, capacity: 40 },
  { id: 3, number: 'BUS-003', route: '102', driver: 'Mike Johnson', status: 'maintenance', passengers: 0, capacity: 40 },
  { id: 4, number: 'BUS-004', route: '103', driver: 'Sarah Williams', status: 'active', passengers: 32, capacity: 40 },
]

const mockRoutes = [
  { id: 1, number: '101', name: 'City Center - Airport', from: 'City Center', to: 'Airport', buses: 2, frequency: '15 min' },
  { id: 2, number: '102', name: 'Downtown - Railway Station', from: 'Downtown', to: 'Railway Station', buses: 1, frequency: '10 min' },
  { id: 3, number: '103', name: 'University - Mall', from: 'University', to: 'Shopping Mall', buses: 1, frequency: '20 min' },
]

const mockDrivers = [
  { id: 1, name: 'John Driver', email: 'john@transport.com', phone: '+91 98765 43210', status: 'active', routes: 2 },
  { id: 2, name: 'Jane Smith', email: 'jane@transport.com', phone: '+91 98765 43211', status: 'active', routes: 1 },
  { id: 3, name: 'Mike Johnson', email: 'mike@transport.com', phone: '+91 98765 43212', status: 'on-leave', routes: 1 },
]

const analyticsData = {
  dailyRidership: [
    { day: 'Mon', passengers: 1200 },
    { day: 'Tue', passengers: 1350 },
    { day: 'Wed', passengers: 1500 },
    { day: 'Thu', passengers: 1400 },
    { day: 'Fri', passengers: 1600 },
    { day: 'Sat', passengers: 1100 },
    { day: 'Sun', passengers: 900 },
  ],
  routePerformance: [
    { route: '101', passengers: 4500, revenue: 67500 },
    { route: '102', passengers: 3200, revenue: 48000 },
    { route: '103', passengers: 2800, revenue: 42000 },
  ],
  busStatus: [
    { name: 'Active', value: 3, color: '#0ea5e9' },
    { name: 'Maintenance', value: 1, color: '#f59e0b' },
  ]
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [buses, setBuses] = useState(mockBuses)
  const [routes, setRoutes] = useState(mockRoutes)
  const [drivers, setDrivers] = useState(mockDrivers)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const stats = {
    totalBuses: buses.length,
    activeBuses: buses.filter(b => b.status === 'active').length,
    totalRoutes: routes.length,
    totalDrivers: drivers.filter(d => d.status === 'active').length,
    totalPassengers: buses.reduce((sum, b) => sum + b.passengers, 0),
    totalRevenue: analyticsData.routePerformance.reduce((sum, r) => sum + r.revenue, 0)
  }

  const deleteItem = (type, id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      if (type === 'bus') {
        setBuses(buses.filter(b => b.id !== id))
      } else if (type === 'route') {
        setRoutes(routes.filter(r => r.id !== id))
      } else if (type === 'driver') {
        setDrivers(drivers.filter(d => d.id !== id))
      }
    }
  }

  const filteredBuses = buses.filter(b => 
    b.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.route.includes(searchQuery) ||
    b.driver.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredRoutes = routes.filter(r =>
    r.number.includes(searchQuery) ||
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredDrivers = drivers.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your transport system</p>
      </div>

      {/* Stats Overview */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Buses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBuses}</p>
                  <p className="text-xs text-green-600 mt-1">{stats.activeBuses} active</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bus className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Routes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRoutes}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Drivers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDrivers}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Passengers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPassengers}</p>
                  <p className="text-xs text-gray-500 mt-1">Currently on buses</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Ridership</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.dailyRidership}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="passengers" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.routePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="route" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="passengers" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bus Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.busStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.busStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {['overview', 'buses', 'routes', 'drivers'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Buses Tab */}
      {activeTab === 'buses' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search buses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              onClick={() => {
                setModalType('bus')
                setShowModal(true)
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Bus</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBuses.map(bus => (
              <div key={bus.id} className="card">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{bus.number}</h3>
                    <p className="text-sm text-gray-600">Route {bus.route}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    bus.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {bus.status}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Driver:</span>
                    <span className="font-medium">{bus.driver}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Passengers:</span>
                    <span className="font-medium">{bus.passengers}/{bus.capacity}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="flex-1 btn-secondary text-sm flex items-center justify-center space-x-1">
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => deleteItem('bus', bus.id)}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg text-sm flex items-center justify-center space-x-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Routes Tab */}
      {activeTab === 'routes' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search routes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              onClick={() => {
                setModalType('route')
                setShowModal(true)
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Route</span>
            </button>
          </div>

          <div className="space-y-4">
            {filteredRoutes.map(route => (
              <div key={route.id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-xl font-bold text-primary-600">#{route.number}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>{route.from} → {route.to}</span>
                      <span>•</span>
                      <span>{route.buses} buses</span>
                      <span>•</span>
                      <span>Frequency: {route.frequency}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button className="btn-secondary text-sm flex items-center space-x-1">
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => deleteItem('route', route.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg text-sm flex items-center space-x-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drivers Tab */}
      {activeTab === 'drivers' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search drivers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              onClick={() => {
                setModalType('driver')
                setShowModal(true)
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Driver</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDrivers.map(driver => (
              <div key={driver.id} className="card">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{driver.name}</h3>
                    <p className="text-sm text-gray-600">{driver.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    driver.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {driver.status}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{driver.phone}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Routes:</span>
                    <span className="font-medium">{driver.routes}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="flex-1 btn-secondary text-sm flex items-center justify-center space-x-1">
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => deleteItem('driver', driver.id)}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg text-sm flex items-center justify-center space-x-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

