import { useState, useEffect } from 'react'
import { Bus, MapPin, Users, TrendingUp, UserCheck, X, Plus, Edit2, Trash2, Power } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { routesAPI, busesAPI, adminAPI } from '../services/api'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [buses, setBuses] = useState([])
  const [routes, setRoutes] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showBusModal, setShowBusModal] = useState(false)
  const [editingBus, setEditingBus] = useState(null)
  const [selectedBus, setSelectedBus] = useState(null)
  const [selectedDriver, setSelectedDriver] = useState('')
  const [busForm, setBusForm] = useState({
    number: '',
    route: '',
    capacity: 40,
    location: { lat: 21.2514, lng: 81.6296 },
    eta: 15,
    currentPassengers: 0,
    active: true
  })
  const [stats, setStats] = useState({
    totalBuses: 0,
    totalRoutes: 0,
    totalDrivers: 0,
    totalUsers: 0,
    totalPassengers: 0
  })
  
  // Fetch all data
  useEffect(() => {
    fetchAllData()
    const interval = setInterval(fetchAllData, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [routesRes, busesRes, driversRes, statsRes] = await Promise.all([
        routesAPI.getAll(),
        busesAPI.getAll(),
        adminAPI.getDrivers(),
        adminAPI.getStats()
      ])
      
      setRoutes(routesRes.data)
      setBuses(busesRes.data)
      setDrivers(driversRes.data)
      setStats(statsRes.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching data:', error)
      setLoading(false)
    }
  }

  const assignDriver = async () => {
    if (!selectedBus || !selectedDriver) {
      alert('Please select both bus and driver')
      return
    }

    try {
      await adminAPI.assignBus(selectedBus._id, selectedDriver)
      alert('Driver assigned successfully!')
      setShowAssignModal(false)
      setSelectedBus(null)
      setSelectedDriver('')
      fetchAllData()
    } catch (error) {
      console.error('Error assigning driver:', error)
      alert(error.response?.data?.error || 'Failed to assign driver')
    }
  }

  const unassignDriver = async (busId) => {
    if (!window.confirm('Are you sure you want to unassign this driver?')) return

    try {
      await adminAPI.assignBus(busId, null)
      alert('Driver unassigned successfully!')
      fetchAllData()
    } catch (error) {
      console.error('Error unassigning driver:', error)
      alert('Failed to unassign driver')
    }
  }

  const openAddBusModal = () => {
    setEditingBus(null)
    setBusForm({
      number: '',
      route: '',
      capacity: 40,
      location: { lat: 21.2514, lng: 81.6296 },
      eta: 15,
      currentPassengers: 0,
      active: true
    })
    setShowBusModal(true)
  }

  const openEditBusModal = (bus) => {
    setEditingBus(bus)
    setBusForm({
      number: bus.number,
      route: bus.route?._id || bus.route,
      capacity: bus.capacity,
      location: bus.location,
      eta: bus.eta,
      currentPassengers: bus.currentPassengers,
      active: bus.active
    })
    setShowBusModal(true)
  }

  const handleBusSubmit = async (e) => {
    e.preventDefault()
    
    if (!busForm.number || !busForm.route) {
      alert('Please fill all required fields')
      return
    }

    try {
      if (editingBus) {
        await busesAPI.update(editingBus._id, busForm)
        alert('Bus updated successfully!')
      } else {
        await busesAPI.create(busForm)
        alert('Bus added successfully!')
      }
      setShowBusModal(false)
      fetchAllData()
    } catch (error) {
      console.error('Error saving bus:', error)
      alert(error.response?.data?.error || 'Failed to save bus')
    }
  }

  const deleteBus = async (busId) => {
    if (!window.confirm('Are you sure you want to delete this bus?')) return

    try {
      await busesAPI.delete(busId)
      alert('Bus deleted successfully!')
      fetchAllData()
    } catch (error) {
      console.error('Error deleting bus:', error)
      alert('Failed to delete bus')
    }
  }

  const toggleBusStatus = async (busId) => {
    try {
      await busesAPI.toggleStatus(busId)
      fetchAllData()
    } catch (error) {
      console.error('Error toggling bus status:', error)
      alert('Failed to update bus status')
    }
  }

  // Analytics data from real routes
  const routeAnalytics = routes.slice(0, 5).map(route => {
    const routeBuses = buses.filter(b => 
      (b.route?._id || b.route) === (route._id || route.id)
    )
    return {
      route: route.number,
      buses: routeBuses.length,
      passengers: routeBuses.reduce((sum, b) => sum + (b.currentPassengers || 0), 0),
      name: route.name
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-purple-100 text-lg">Manage your transport system</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md p-2 flex space-x-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
            activeTab === 'overview'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('buses')}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
            activeTab === 'buses'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Buses
        </button>
        <button
          onClick={() => setActiveTab('routes')}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
            activeTab === 'routes'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Routes
        </button>
        <button
          onClick={() => setActiveTab('drivers')}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
            activeTab === 'drivers'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Drivers
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Buses</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalBuses}</p>
                  <p className="text-xs text-green-600 mt-1">{buses.filter(b => b.driver).length} assigned</p>
                </div>
                <div className="h-14 w-14 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
                  <Bus className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Routes</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalRoutes}</p>
                </div>
                <div className="h-14 w-14 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-md">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Drivers</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalDrivers}</p>
                </div>
                <div className="h-14 w-14 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                  <Users className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Current Passengers</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalPassengers}</p>
                </div>
                <div className="h-14 w-14 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-pink-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
                </div>
                <div className="h-14 w-14 bg-gradient-to-br from-pink-400 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                  <Users className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-indigo-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Assigned Buses</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{buses.filter(b => b.driver).length}</p>
                  <p className="text-xs text-gray-600 mt-1">of {stats.totalBuses} total</p>
                </div>
                <div className="h-14 w-14 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                  <UserCheck className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Route Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={routeAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="route" />
                <YAxis />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                          <p className="font-semibold">{payload[0].payload.name}</p>
                          <p className="text-sm text-blue-600">Buses: {payload[0].value}</p>
                          <p className="text-sm text-green-600">Passengers: {payload[0].payload.passengers}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="buses" fill="url(#colorBuses)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorBuses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Buses Tab */}
      {activeTab === 'buses' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Bus Management</h3>
            <button
              onClick={openAddBusModal}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add New Bus
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Bus Number</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Route</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Driver</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Passengers</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {buses.map((bus) => (
                  <tr key={bus._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                          <Bus className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-semibold">{bus.number}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium">{bus.route?.number}</p>
                        <p className="text-sm text-gray-500">{bus.route?.name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {bus.driver ? (
                        <div>
                          <p className="font-medium text-green-600">{bus.driver.name}</p>
                          <p className="text-sm text-gray-500">{bus.driver.email}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Not assigned</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{bus.currentPassengers || 0}/{bus.capacity}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {bus.active ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleBusStatus(bus._id)}
                          className={`p-2 rounded-lg transition-all ${
                            bus.active
                              ? 'bg-green-100 text-green-600 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={bus.active ? 'Deactivate' : 'Activate'}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditBusModal(bus)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                          title="Edit Bus"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteBus(bus._id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                          title="Delete Bus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        {bus.driver ? (
                          <button
                            onClick={() => unassignDriver(bus._id)}
                            className="px-3 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-all font-medium text-sm"
                          >
                            Unassign
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedBus(bus)
                              setShowAssignModal(true)
                            }}
                            className="px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
                          >
                            Assign
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Routes Tab */}
      {activeTab === 'routes' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Route Management</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {routes.map((route) => {
              const routeBuses = buses.filter(b => 
                (b.route?._id || b.route) === (route._id || route.id)
              )
              return (
                <div key={route._id || route.id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md p-6 border-2 border-gray-100 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                      {route.number}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{route.name}</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>From: <span className="font-medium">{route.from}</span></p>
                    <p>To: <span className="font-medium">{route.to}</span></p>
                    <p>Distance: <span className="font-medium">{route.distance}</span></p>
                    <p>Buses: <span className="font-medium">{routeBuses.length}</span></p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Drivers Tab */}
      {activeTab === 'drivers' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Driver Management</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map((driver) => {
              const assignedBus = buses.find(b => b.driver?._id === driver._id)
              return (
                <div key={driver._id} className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-md p-6 border-2 border-purple-100">
                  <div className="flex items-center mb-4">
                    <div className="h-14 w-14 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {driver.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-bold text-gray-900">{driver.name}</h4>
                      <p className="text-sm text-gray-600">{driver.email}</p>
                    </div>
                  </div>
                  
                  {assignedBus ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-700 font-medium">Assigned to:</p>
                      <p className="text-lg font-bold text-green-900">Bus {assignedBus.number}</p>
                      <p className="text-sm text-green-600">{assignedBus.route?.name}</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-sm text-gray-500 italic">No bus assigned</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Assign Driver Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Assign Driver</h3>
              <button
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedBus(null)
                  setSelectedDriver('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bus</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-semibold">{selectedBus?.number}</p>
                  <p className="text-sm text-gray-600">{selectedBus?.route?.name}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Driver</label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Choose a driver...</option>
                  {drivers.filter(d => !buses.find(b => b.driver?._id === d._id)).map((driver) => (
                    <option key={driver._id} value={driver._id}>
                      {driver.name} - {driver.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedBus(null)
                    setSelectedDriver('')
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={assignDriver}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Bus Modal */}
      {showBusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingBus ? 'Edit Bus' : 'Add New Bus'}
              </h3>
              <button
                onClick={() => setShowBusModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleBusSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bus Number *</label>
                <input
                  type="text"
                  value={busForm.number}
                  onChange={(e) => setBusForm({ ...busForm, number: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., BUS-001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Route *</label>
                <select
                  value={busForm.route}
                  onChange={(e) => setBusForm({ ...busForm, route: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a route...</option>
                  {routes.map((route) => (
                    <option key={route._id} value={route._id}>
                      {route.number} - {route.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                  <input
                    type="number"
                    value={busForm.capacity}
                    onChange={(e) => setBusForm({ ...busForm, capacity: parseInt(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ETA (min)</label>
                  <input
                    type="number"
                    value={busForm.eta}
                    onChange={(e) => setBusForm({ ...busForm, eta: parseInt(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={busForm.location.lat}
                    onChange={(e) => setBusForm({ 
                      ...busForm, 
                      location: { ...busForm.location, lat: parseFloat(e.target.value) }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={busForm.location.lng}
                    onChange={(e) => setBusForm({ 
                      ...busForm, 
                      location: { ...busForm.location, lng: parseFloat(e.target.value) }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Passengers</label>
                <input
                  type="number"
                  value={busForm.currentPassengers}
                  onChange={(e) => setBusForm({ ...busForm, currentPassengers: parseInt(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max={busForm.capacity}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={busForm.active}
                  onChange={(e) => setBusForm({ ...busForm, active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="active" className="ml-2 text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBusModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  {editingBus ? 'Update Bus' : 'Add Bus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
