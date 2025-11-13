import { useState, useEffect } from 'react'
import { Search, MapPin, Clock, Users, Bus, Star } from 'lucide-react'
import { FaList, FaMap } from 'react-icons/fa'
import RouteCard from '../components/RouteCard'
import MapView from '../components/MapView'
import { routesAPI } from '../services/api'

export default function UserDashboard({ isPublic = false }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [viewMode, setViewMode] = useState('map') // 'list' or 'map'
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchRoutes()
    // Set up real-time updates every 5 seconds
    const interval = setInterval(() => {
      fetchRoutes()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const fetchRoutes = async () => {
    try {
      const response = await routesAPI.getAll()
      setRoutes(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching routes:', err)
      setError('Failed to load routes')
      setLoading(false)
    }
  }

  const toggleFavorite = (routeId) => {
    setRoutes(prevRoutes =>
      prevRoutes.map(route =>
        route.id === routeId ? { ...route, favorite: !route.favorite } : route
      )
    )
  }

  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.number.includes(searchQuery) ||
    route.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.to.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const favoriteRoutes = routes.filter(route => route.favorite)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading routes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchRoutes}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Find Your Bus</h1>
            <p className="text-blue-100 text-lg">Track buses in real-time across the city</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode('list')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md flex items-center gap-2 ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                  : 'bg-blue-500 bg-opacity-50 text-white hover:bg-opacity-70'
              }`}
            >
              <FaList /> List View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md flex items-center gap-2 ${
                viewMode === 'map'
                  ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                  : 'bg-blue-500 bg-opacity-50 text-white hover:bg-opacity-70'
              }`}
            >
              <FaMap /> Map View
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {!isPublic && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search routes, bus numbers, or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
      )}

      {/* Favorites Section */}
      {!isPublic && favoriteRoutes.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900">Favorite Routes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {favoriteRoutes.map(route => (
              <RouteCard
                key={route.id}
                route={route}
                onSelect={() => setSelectedRoute(route)}
                onToggleFavorite={() => toggleFavorite(route.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      {viewMode === 'map' ? (
        <MapView routes={filteredRoutes} selectedRoute={selectedRoute} onRouteSelect={setSelectedRoute} />
      ) : (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {searchQuery ? `Search Results (${filteredRoutes.length})` : 'All Routes'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoutes.map(route => (
              <RouteCard
                key={route.id}
                route={route}
                onSelect={() => setSelectedRoute(route)}
                onToggleFavorite={() => toggleFavorite(route.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Route Details Modal */}
      {selectedRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative" style={{ zIndex: 10000 }}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Route {selectedRoute.number}</h3>
                  <p className="text-gray-600">{selectedRoute.name}</p>
                </div>
                <button
                  onClick={() => setSelectedRoute(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedRoute.distance}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{selectedRoute.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Bus className="h-4 w-4" />
                    <span>{selectedRoute.frequency}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Available Buses</h4>
                  <div className="space-y-3">
                    {selectedRoute.buses.map(bus => (
                      <div key={bus.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{bus.number}</p>
                            <p className="text-sm text-gray-600">
                              {selectedRoute.from} → {selectedRoute.to}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary-600">{bus.eta} min</p>
                            <p className="text-xs text-gray-500">ETA</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>{bus.passengers}/{bus.capacity} passengers</span>
                          </div>
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${(bus.passengers / bus.capacity) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

