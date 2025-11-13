import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Loader } from 'lucide-react'
import { FaBus, FaMapMarkerAlt, FaExclamationTriangle } from 'react-icons/fa'
import 'leaflet/dist/leaflet.css'


// Fix Leaflet default icon issue
if (L.Icon.Default.prototype._getIconUrl) {
  delete L.Icon.Default.prototype._getIconUrl
}
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom user location icon
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#3b82f6" stroke="white" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="3" fill="white"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
})

// Custom bus icon
const busIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#dc2626" stroke="white" stroke-width="2">
      <rect x="3" y="6" width="18" height="12" rx="2"/>
      <path d="M3 10h18M7 6V4M17 6V4M7 18v2M17 18v2"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
})

function MapUpdater({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], map.getZoom())
    }
  }, [center, map])
  return null
}

export default function MapView({ routes, selectedRoute, onRouteSelect }) {
  const [userLocation, setUserLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mapReady, setMapReady] = useState(false)
  const [cityName, setCityName] = useState('')

  // Function to get city name from coordinates
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
                     data.address.state || 
                     'Unknown Location'
        const state = data.address.state || ''
        return state ? `${city}, ${state}` : city
      }
      return 'Location detected'
    } catch (error) {
      console.error('Error fetching city name:', error)
      return 'Location detected'
    }
  }

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          console.log('User location detected:', userLoc)
          setUserLocation(userLoc)
          setLocationError(null)
          
          // Fetch city name
          const city = await getCityName(userLoc.lat, userLoc.lng)
          setCityName(city)
          
          setLoading(false)
        },
        async (error) => {
          console.error('Error getting location:', error)
          let errorMsg = ''
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = 'Location permission denied. Please enable location access.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMsg = 'Location information unavailable.'
              break
            case error.TIMEOUT:
              errorMsg = 'Location request timed out.'
              break
            default:
              errorMsg = error.message
          }
          setLocationError(errorMsg)
          // Default to Raipur, Chhattisgarh coordinates if location access fails
          const defaultLoc = { lat: 21.2514, lng: 81.6296 }
          setUserLocation(defaultLoc)
          
          // Fetch city name for default location
          const city = await getCityName(defaultLoc.lat, defaultLoc.lng)
          setCityName(city)
          
          setLoading(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      setLocationError('Geolocation is not supported by your browser')
      // Default to Raipur, Chhattisgarh
      const defaultLoc = { lat: 21.2514, lng: 81.6296 }
      setUserLocation(defaultLoc)
      
      // Fetch city name for default location
      getCityName(defaultLoc.lat, defaultLoc.lng).then(city => setCityName(city))
      
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (userLocation && !mapReady) {
      const timer = setTimeout(() => {
        setMapReady(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [userLocation, mapReady])

  const allBuses = routes.flatMap(route => 
    route.buses.map(bus => ({ ...bus, route }))
  )

  if (loading || !userLocation) {
    return (
      <div className="card">
        <div className="flex items-center justify-center" style={{ height: '600px' }}>
          <div className="text-center">
            <Loader className="h-12 w-12 text-primary-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Getting your location...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!mapReady) {
    return (
      <div className="card">
        <div className="flex items-center justify-center" style={{ height: '600px' }}>
          <div className="text-center">
            <Loader className="h-12 w-12 text-primary-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Live Bus Locations</span>
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 font-medium flex items-center gap-2">
            <FaBus className="text-blue-600" /> {allBuses.length} buses active {cityName && (
              <>
                <span>•</span>
                <FaMapMarkerAlt className="text-red-500" />
                <span>{cityName}</span>
              </>
            )}
          </p>
          {locationError && (
            <p className="text-xs text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full font-medium shadow-sm flex items-center gap-1">
              <FaExclamationTriangle /> {locationError}
            </p>
          )}
        </div>
      </div>

      {/* Real Map */}
      <div className="relative" style={{ height: '600px' }}>
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapUpdater center={userLocation} />
          
          {/* User Location Marker */}
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-blue-600">Your Location</p>
                {cityName && (
                  <p className="text-sm text-gray-700 mt-1">{cityName}</p>
                )}
              </div>
            </Popup>
          </Marker>

          {/* Bus Markers */}
          {allBuses.map((bus) => (
            <Marker 
              key={bus.id} 
              position={[bus.lat, bus.lng]}
              icon={busIcon}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <p className="font-semibold text-red-600">{bus.number}</p>
                  <p className="text-sm text-gray-700 mt-1">Route {bus.route.number}</p>
                  <p className="text-xs text-gray-600">{bus.route.name}</p>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-sm">
                      <span className="font-medium">ETA:</span> {Math.round(bus.eta)} min
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Passengers:</span> {bus.passengers}/{bus.capacity}
                    </p>
                  </div>
                  <button
                    onClick={() => onRouteSelect(bus.route)}
                    className="mt-2 w-full bg-primary-600 text-white text-sm py-1 px-2 rounded hover:bg-primary-700"
                  >
                    View Route Details
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Bus List */}
      <div className="p-6 bg-gray-50">
        <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Available Routes</span>
        </h4>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-200">
          {routes.map(route => (
            <div
              key={route.id}
              onClick={() => onRouteSelect(route)}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1 ${
                selectedRoute?.id === route.id
                  ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900 text-lg">Route {route.number}</p>
                  <p className="text-sm text-gray-600 mt-1">{route.name}</p>
                </div>
                <div className="text-right">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-1 shadow-sm">
                    {route.buses.length} bus{route.buses.length !== 1 ? 'es' : ''}
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    ETA: {Math.round(Math.min(...route.buses.map(b => b.eta)))} min
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

