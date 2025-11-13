# Public Transport Tracking System

A comprehensive real-time public transport tracking system for small cities with role-based access control.

## Features

- **Real-time Bus Tracking**: GPS-based tracking with live location updates
- **Role-Based Access**: Separate dashboards for Users, Drivers, and Admins
- **Route Management**: View routes, search buses, and get estimated arrival times
- **Low-Bandwidth Optimized**: Designed for tier-2 cities with limited connectivity
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS

## Roles

### User
- View real-time bus locations on map
- Search routes and buses
- Get estimated arrival times
- View route details and schedules
- Save favorite routes

### Driver
- Update location in real-time
- View assigned routes
- Manage trip status
- View passenger count
- Track daily schedule

### Admin
- Manage buses and routes
- Assign drivers to routes
- View analytics and reports
- Manage users and drivers
- Monitor system performance

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app will be available at `http://localhost:3000`

## Default Login Credentials

### Admin
- Email: admin@transport.com
- Password: admin123

### Driver
- Email: driver@transport.com
- Password: driver123

### User
- Email: user@transport.com
- Password: user123

## Tech Stack

- React 18
- Vite
- React Router
- Tailwind CSS
- Lucide Icons
- Recharts (for analytics)

