import { useState, useEffect } from 'react'
import { MapPin, Clock, Users, Play, Pause, CheckCircle, Bus, Smartphone, AlertCircle } from 'lucide-react'
import { FaMapMarkerAlt } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'
import { busesAPI } from '../services/api'

export default function DriverDashboard() {
  const { user } = useAuth()
  const [assignedBus, setAssignedBus] = useState(null)
  const [route, setRoute] = useState(null)
  const [isTracking, setIsTracking] = useState(false)
  const [location, setLocation] = useState(null)
  const [cityName, setCityName] = useState('')
  const [passengers, setPassengers] = useState(0)
  const [eta, setEta] = useState(15)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    completedTrips: 2,
    todayEarnings: 300,
    activePassengers: 0
  })

  // Fetch city name from coordinates
  const getCityName = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      )
      const data = await response.json()
      
      if (data.address) {
        const city = data.address.city || 
                     data.address.town || 
                     data.address.village || 
                     data.address.state_district || 
                     'Unknown'
        const state = data.address.state || ''
        return state ? `${city}, ${state}` : city
      }
      return 'Location detected'
    } catch (error) {
      console.error('Error fetching city name:', error)
      return 'Location detected'
    }
  }

  // Fetch assigned bus for this driver
  useEffect(() => {
    const fetchAssignedBus = async () => {
      try {
        const response = await busesAPI.getAll()
        const buses = response.data
        // Find bus assigned to this driver
        const myBus = buses.find(b => b.driver && b.driver._id === user?.id)
        
        if (myBus) {
          setAssignedBus(myBus)
          setPassengers(myBus.currentPassengers || 0)
          setEta(myBus.eta || 15)
          setLocation(myBus.location)
          
          // Get route from bus object (already populated)
          if (myBus.route) {
            setRoute(myBus.route)
          }
          
          // Get city name for current location
          if (myBus.location) {
            const city = await getCityName(myBus.location.lat, myBus.location.lng)
            setCityName(city)
          }
        }
        setLoading(false)
      } catch (error) {
        console.error('Error fetching assigned bus:', error)
        setLoading(false)
      }
    }

    fetchAssignedBus()
  }, [user])

  // Track location when tracking is enabled
  useEffect(() => {
    if (isTracking && assignedBus) {
      const trackLocation = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const newLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
              setLocation(newLocation)
              
              // Get city name
              const city = await getCityName(newLocation.lat, newLocation.lng)
              setCityName(city)
              
              // Update backend
              try {
                await busesAPI.updateLocation(assignedBus._id, {
                  lat: newLocation.lat,
                  lng: newLocation.lng,
                  currentPassengers: passengers,
                  eta: eta
                })
              } catch (error) {
                console.error('Error updating location:', error)
              }
            },
            () => {
              console.warn('Location access denied, using fallback')
              // Fallback to simulated location
              setLocation(prev => prev || { lat: 21.2514, lng: 81.6296 })
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          )
        }
      }

      // Track immediately
      trackLocation()
      
      // Track every 10 seconds
      const interval = setInterval(trackLocation, 10000)
      return () => clearInterval(interval)
    }
  }, [isTracking, assignedBus, passengers, eta])

  const updatePassengerCount = async (newCount) => {
    const count = Math.max(0, Math.min(assignedBus?.capacity || 40, newCount))
    setPassengers(count)
    setStats(prev => ({ ...prev, activePassengers: count }))
    
    // Update backend if tracking
    if (isTracking && assignedBus && location) {
      try {
        await busesAPI.updateLocation(assignedBus._id, {
          lat: location.lat,
          lng: location.lng,
          currentPassengers: count,
          eta: eta
        })
      } catch (error) {
        console.error('Error updating passenger count:', error)
      }
    }
  }

  const updateETA = async (newEta) => {
    setEta(newEta)
    
    // Update backend if tracking
    if (isTracking && assignedBus && location) {
      try {
        await busesAPI.updateLocation(assignedBus._id, {
          lat: location.lat,
          lng: location.lng,
          currentPassengers: passengers,
          eta: newEta
        })
      } catch (error) {
        console.error('Error updating ETA:', error)
      }
    }
  }

  const startTracking = () => {
    setIsTracking(true)
  }

  const stopTracking = () => {
    setIsTracking(false)
  }

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

  if (!assignedBus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold text-xl mb-2">No Bus Assigned</p>
          <p className="text-gray-600">Please contact the administrator to assign a bus to your account.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl shadow-xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Driver Dashboard</h1>
        <p className="text-green-100 text-lg">Welcome back, {user?.name}</p>
      </div>

      {/* Mobile Location Tracking Notice */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Smartphone className="h-6 w-6 text-blue-600 mt-0.5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-blue-900 mb-1">📱 Mobile Location Tracking</h3>
          <p className="text-sm text-blue-800">
            Your mobile device&apos;s GPS is used to track the bus position in real-time. 
            Make sure location services are enabled for accurate tracking.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Completed Trips</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completedTrips}</p>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-md">
              <CheckCircle className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Today&apos;s Earnings</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">₹{stats.todayEarnings}</p>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
              <Users className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Passengers</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{passengers}</p>
            </div>
            <div className="h-14 w-14 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
              <Bus className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Trip Section */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-green-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b-2 border-green-100">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Active Trip</h2>
              <p className="text-gray-600">Bus {assignedBus.number} • Route {route?.number}: {route?.name}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                isTracking ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {isTracking ? '🟢 Tracking' : '⚫ Paused'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
              <p className="text-sm text-blue-700 font-medium mb-1 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Next Stop
              </p>
              <p className="font-bold text-gray-900 text-lg">{route?.to || 'Destination'}</p>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border-2 border-amber-200">
              <p className="text-sm text-amber-700 font-medium mb-1 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Estimated Arrival
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={eta}
                  onChange={(e) => updateETA(parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 border-2 border-amber-300 rounded-lg font-bold text-lg"
                  min="0"
                />
                <span className="font-bold text-gray-900">min</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
              <p className="text-sm text-green-700 font-medium mb-1 flex items-center gap-2">
                <FaMapMarkerAlt className="h-4 w-4" />
                Current Location
              </p>
              <p className="font-bold text-gray-900">{cityName || 'Detecting...'}</p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Smartphone className="h-3 w-3" />
                Mobile GPS
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-bold text-gray-700">Passenger Load</p>
              <p className="text-sm text-gray-600 font-medium">
                {passengers} / {assignedBus.capacity}
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-300 shadow-md"
                style={{ width: `${(passengers / assignedBus.capacity) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="flex space-x-3 mb-6">
            {!isTracking ? (
              <button
                onClick={startTracking}
                className="flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Play className="h-5 w-5" />
                <span>Start Tracking</span>
              </button>
            ) : (
              <button
                onClick={stopTracking}
                className="flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg transition-all duration-200"
              >
                <Pause className="h-5 w-5" />
                <span>Pause Tracking</span>
              </button>
            )}
          </div>

          <div className="pt-6 border-t-2 border-gray-200">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Update Passenger Count
            </label>
            <div className="flex space-x-3">
              <button
                onClick={() => updatePassengerCount(passengers - 1)}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-bold text-xl shadow-md transition-all duration-200 transform hover:scale-105"
              >
                -
              </button>
              <input
                type="number"
                value={passengers}
                onChange={(e) => updatePassengerCount(parseInt(e.target.value) || 0)}
                className="flex-1 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                min="0"
                max={assignedBus.capacity}
              />
              <button
                onClick={() => updatePassengerCount(passengers + 1)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold text-xl shadow-md transition-all duration-200 transform hover:scale-105"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Route Information */}
      {route && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Route Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">From</p>
                <p className="font-semibold text-gray-900">{route.from}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-xs text-gray-500">To</p>
                <p className="font-semibold text-gray-900">{route.to}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <p className="font-semibold text-gray-900">{route.duration}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Bus className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">Frequency</p>
                <p className="font-semibold text-gray-900">{route.frequency}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
