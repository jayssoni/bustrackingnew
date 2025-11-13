import { MapPin, Clock, Bus, Star, Navigation } from 'lucide-react'

export default function RouteCard({ route, onSelect, onToggleFavorite }) {
  const nearestBus = route.buses.reduce((nearest, bus) => 
    bus.eta < nearest.eta ? bus : nearest, route.buses[0]
  )

  return (
    <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={onSelect}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary-600">#{route.number}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite()
              }}
              className="text-gray-400 hover:text-yellow-500 transition-colors"
            >
              <Star className={`h-5 w-5 ${route.favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
            </button>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mt-1">{route.name}</h3>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2" />
          <span>{route.from} → {route.to}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-2" />
          <span>{route.duration} • {route.distance}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Bus className="h-4 w-4 mr-2" />
          <span>{route.frequency}</span>
        </div>
      </div>

      {nearestBus && (
        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Nearest Bus</p>
              <p className="text-sm font-medium text-gray-900">{nearestBus.number}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary-600">{Math.round(nearestBus.eta)} min</p>
              <p className="text-xs text-gray-500">ETA</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

