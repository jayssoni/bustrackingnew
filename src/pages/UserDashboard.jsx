import { useState, useEffect } from 'react'
import { Search, MapPin, Clock, Users, Bus, Star, Navigation } from 'lucide-react'
import RouteCard from '../components/RouteCard'
import MapView from '../components/MapView'

const mockRoutes = [
  {
    id: 1,
    number: '101',
    name: 'City Center - Airport',
    from: 'City Center',
    to: 'Airport',
    distance: '15 km',
    duration: '45 min',
    frequency: 'Every 15 min',
    buses: [
      { id: 1, number: 'BUS-001', eta: 5, passengers: 25, capacity: 40, lat: 28.6139, lng: 77.2090 },
      { id: 2, number: 'BUS-002', eta: 12, passengers: 18, capacity: 40, lat: 28.6145, lng: 77.2100 },
    ],
    favorite: false
  },
  {
    id: 2,
    number: '102',
    name: 'Downtown - Railway Station',
    from: 'Downtown',
    to: 'Railway Station',
    distance: '8 km',
    duration: '30 min',
    frequency: 'Every 10 min',
    buses: [
      { id: 3, number: 'BUS-003', eta: 8, passengers: 32, capacity: 40, lat: 28.6120, lng: 77.2080 },
    ],
    favorite: true
  },
  {
    id: 3,
    number: '103',
    name: 'University - Mall',
    from: 'University',
    to: 'Shopping Mall',
    distance: '12 km',
    duration: '35 min',
    frequency: 'Every 20 min',
    buses: [
      { id: 4, number: 'BUS-004', eta: 15, passengers: 12, capacity: 40, lat: 28.6150, lng: 77.2110 },
      { id: 5, number: 'BUS-005', eta: 22, passengers: 8, capacity: 40, lat: 28.6160, lng: 77.2120 },
    ],
    favorite: false
  },
]

export default function UserDashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'map'
  const [routes, setRoutes] = useState(mockRoutes)

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setRoutes(prevRoutes => 
        prevRoutes.map(route => ({
          ...route,
          buses: route.buses.map(bus => ({
            ...bus,
            eta: Math.max(1, bus.eta - 0.5),
            passengers: Math.min(bus.capacity, bus.passengers + Math.floor(Math.random() * 3) - 1)
          }))
        }))
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Find Your Bus</h1>
          <p className="text-gray-600 mt-1">Track buses in real-time</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'map'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Map View
          </button>
        </div>
      </div>

      {/* Search Bar */}
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

      {/* Favorites Section */}
      {favoriteRoutes.length > 0 && (
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
      {viewMode === 'list' ? (
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
      ) : (
        <MapView routes={filteredRoutes} selectedRoute={selectedRoute} onRouteSelect={setSelectedRoute} />
      )}

      {/* Route Details Modal */}
      {selectedRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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

