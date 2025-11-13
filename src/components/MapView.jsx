import { useState } from 'react'
import { MapPin, Bus, Navigation } from 'lucide-react'

export default function MapView({ routes, selectedRoute, onRouteSelect }) {
  const [center, setCenter] = useState({ lat: 28.6139, lng: 77.2090, zoom: 12 })

  // Simple map representation - in production, use Google Maps or Mapbox
  const allBuses = routes.flatMap(route => 
    route.buses.map(bus => ({ ...bus, route }))
  )

  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Bus Locations</h3>
        <p className="text-sm text-gray-600">{allBuses.length} buses active</p>
      </div>

      {/* Map Container */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '500px' }}>
        {/* Simple map visualization */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-16 w-16 text-primary-400 mx-auto mb-4" />
            <p className="text-gray-600">Map View</p>
            <p className="text-sm text-gray-500 mt-2">
              {allBuses.length} buses tracked in real-time
            </p>
          </div>
        </div>

        {/* Bus markers */}
        {allBuses.map((bus, index) => (
          <div
            key={bus.id}
            className="absolute"
            style={{
              left: `${50 + (index % 3) * 10}%`,
              top: `${40 + Math.floor(index / 3) * 15}%`,
            }}
          >
            <div className="relative">
              <div className="bg-primary-600 text-white rounded-full p-2 shadow-lg cursor-pointer hover:scale-110 transition-transform">
                <Bus className="h-4 w-4" />
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <div className="bg-white rounded px-2 py-1 shadow text-xs font-medium">
                  {bus.number}
                </div>
                <div className="text-xs text-center mt-1 text-gray-600">
                  {Math.round(bus.eta)} min
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bus List */}
      <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
        {routes.map(route => (
          <div
            key={route.id}
            onClick={() => onRouteSelect(route)}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedRoute?.id === route.id
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-900">Route {route.number}</p>
                <p className="text-sm text-gray-600">{route.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-primary-600">
                  {route.buses.length} bus{route.buses.length !== 1 ? 'es' : ''}
                </p>
                <p className="text-xs text-gray-500">
                  ETA: {Math.round(Math.min(...route.buses.map(b => b.eta)))} min
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This is a simplified map view. In production, this would integrate with Google Maps or Mapbox for accurate GPS tracking.
        </p>
      </div>
    </div>
  )
}

