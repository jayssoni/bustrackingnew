import { useState, useEffect } from 'react'
import { MapPin, Clock, Users, Navigation, Play, Pause, CheckCircle, AlertCircle, Bus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const mockAssignedRoutes = [
  {
    id: 1,
    number: '101',
    name: 'City Center - Airport',
    from: 'City Center',
    to: 'Airport',
    startTime: '08:00',
    endTime: '18:00',
    totalTrips: 6,
    completedTrips: 2,
    currentTrip: {
      id: 1,
      status: 'in-progress', // 'scheduled', 'in-progress', 'completed'
      passengers: 25,
      capacity: 40,
      currentLocation: { lat: 28.6139, lng: 77.2090 },
      nextStop: 'Airport Terminal',
      estimatedArrival: 15
    }
  },
  {
    id: 2,
    number: '102',
    name: 'Downtown - Railway Station',
    from: 'Downtown',
    to: 'Railway Station',
    startTime: '09:00',
    endTime: '19:00',
    totalTrips: 5,
    completedTrips: 0,
    currentTrip: null
  }
]

export default function DriverDashboard() {
  const { user } = useAuth()
  const [routes, setRoutes] = useState(mockAssignedRoutes)
  const [activeRoute, setActiveRoute] = useState(routes[0])
  const [isTracking, setIsTracking] = useState(true)
  const [location, setLocation] = useState({ lat: 28.6139, lng: 77.2090 })

  useEffect(() => {
    if (isTracking && activeRoute?.currentTrip) {
      // Simulate location updates
      const interval = setInterval(() => {
        setLocation(prev => ({
          lat: prev.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.lng + (Math.random() - 0.5) * 0.001
        }))
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [isTracking, activeRoute])

  const startTrip = (routeId) => {
    setRoutes(prevRoutes =>
      prevRoutes.map(route => {
        if (route.id === routeId && !route.currentTrip) {
          return {
            ...route,
            currentTrip: {
              id: Date.now(),
              status: 'in-progress',
              passengers: 0,
              capacity: 40,
              currentLocation: location,
              nextStop: route.to,
              estimatedArrival: 30
            }
          }
        }
        return route
      })
    )
    setActiveRoute(routes.find(r => r.id === routeId))
    setIsTracking(true)
  }

  const endTrip = (routeId) => {
    setRoutes(prevRoutes =>
      prevRoutes.map(route => {
        if (route.id === routeId && route.currentTrip) {
          return {
            ...route,
            completedTrips: route.completedTrips + 1,
            currentTrip: null
          }
        }
        return route
      })
    )
    setIsTracking(false)
  }

  const updatePassengerCount = (routeId, count) => {
    setRoutes(prevRoutes =>
      prevRoutes.map(route => {
        if (route.id === routeId && route.currentTrip) {
          return {
            ...route,
            currentTrip: {
              ...route.currentTrip,
              passengers: Math.max(0, Math.min(route.currentTrip.capacity, count))
            }
          }
        }
        return route
      })
    )
  }

  const stats = {
    totalTrips: routes.reduce((sum, r) => sum + r.completedTrips, 0),
    todayEarnings: routes.reduce((sum, r) => sum + r.completedTrips * 150, 0),
    activePassengers: activeRoute?.currentTrip?.passengers || 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Trips</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTrips}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Earnings</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.todayEarnings}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Passengers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activePassengers}</p>
            </div>
            <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Bus className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Trip */}
      {activeRoute?.currentTrip && (
        <div className="card border-2 border-primary-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Active Trip</h2>
              <p className="text-gray-600">Route {activeRoute.number}: {activeRoute.name}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isTracking ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {isTracking ? 'Tracking' : 'Paused'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Next Stop</p>
              <p className="font-semibold text-gray-900">{activeRoute.currentTrip.nextStop}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Estimated Arrival</p>
              <p className="font-semibold text-gray-900">{activeRoute.currentTrip.estimatedArrival} min</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Current Location</p>
              <p className="font-semibold text-gray-900 text-xs">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-700">Passengers</p>
              <p className="text-sm text-gray-600">
                {activeRoute.currentTrip.passengers} / {activeRoute.currentTrip.capacity}
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all"
                style={{ width: `${(activeRoute.currentTrip.passengers / activeRoute.currentTrip.capacity) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setIsTracking(!isTracking)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                isTracking
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isTracking ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Pause Tracking</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Resume Tracking</span>
                </>
              )}
            </button>
            <button
              onClick={() => endTrip(activeRoute.id)}
              className="flex-1 btn-primary"
            >
              End Trip
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Passenger Count
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => updatePassengerCount(activeRoute.id, activeRoute.currentTrip.passengers - 1)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
              >
                -
              </button>
              <input
                type="number"
                value={activeRoute.currentTrip.passengers}
                onChange={(e) => updatePassengerCount(activeRoute.id, parseInt(e.target.value) || 0)}
                className="flex-1 input-field text-center"
                min="0"
                max={activeRoute.currentTrip.capacity}
              />
              <button
                onClick={() => updatePassengerCount(activeRoute.id, activeRoute.currentTrip.passengers + 1)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assigned Routes */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Routes</h2>
        <div className="space-y-4">
          {routes.map(route => (
            <div key={route.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-xl font-bold text-primary-600">#{route.number}</span>
                    <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{route.from} → {route.to}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{route.startTime} - {route.endTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Bus className="h-4 w-4" />
                      <span>{route.completedTrips} / {route.totalTrips} trips</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${(route.completedTrips / route.totalTrips) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4">
                  {route.currentTrip ? (
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-2">
                        In Progress
                      </span>
                      <button
                        onClick={() => setActiveRoute(route)}
                        className="block w-full btn-primary text-sm"
                      >
                        View Trip
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startTrip(route.id)}
                      className="btn-primary"
                    >
                      Start Trip
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

