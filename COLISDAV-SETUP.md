# COLISDAV Multi-App System Setup Guide

## Overview

COLISDAV is a unified ride-sharing platform with separate user and rider applications that communicate in real-time through a single backend infrastructure.

## Architecture

- **User App**: Port 8081 - For passengers requesting rides
- **Rider App**: Port 8082 - For drivers accepting and managing rides
- **Unified Backend**: Multi-server architecture supporting both apps
- **Real-time Communication**: Socket.IO for cross-app messaging

## Quick Start

### 1. Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database
- Expo CLI (for mobile apps)

### 2. Database Setup

```bash
# Create database
createdb colisdav_db

# Run migrations
cd backend
npm run migration:run
```

### 3. Environment Configuration

Create `.env` files in both backend directories:

**Backend (.env):**

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=colisdav_db
JWT_SECRET=your_jwt_secret
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret
FLUTTERWAVE_WEBHOOK_HASH=your_webhook_hash
```

**Rider App (.env):**

```
EXPO_PUBLIC_API_URL=http://localhost:8082
EXPO_PUBLIC_USER_API_URL=http://localhost:8081
EXPO_PUBLIC_RIDER_API_URL=http://localhost:8082
```

### 4. Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Rider app dependencies
cd ../colisdav rider/expo
npm install

# User app dependencies
cd ../../
npm install
```

### 5. Start the System

#### Option A: Manual Start (Development)

```bash
# Terminal 1: Start backend
cd backend
npm run multi

# Terminal 2: Start rider app
cd colisdav rider/expo
npm start

# Terminal 3: Start user app
cd ../../
npm start
```

#### Option B: Automated Start (Windows)

```bash
# Run the batch script
start-colisdav.bat
```

## API Endpoints

### User App (Port 8081)

- `GET /api/users` - User management
- `POST /api/rides` - Create ride requests
- `GET /api/rides/:id` - Get ride details
- `POST /api/transactions` - Process payments
- `GET /api/notifications` - User notifications

### Rider App (Port 8082)

- `GET /api/drivers/:id/profile` - Driver profile
- `GET /api/drivers/:id/stats` - Driver statistics
- `GET /api/drivers/:id/ride-requests` - Available ride requests
- `POST /api/drivers/:id/accept-ride` - Accept ride request
- `PUT /api/drivers/:id/location` - Update driver location

## Cross-App Communication

### Real-time Events

#### User App → Rider App

- `ride-request` - New ride request broadcast
- `ride-cancelled` - Ride cancellation notification

#### Rider App → User App

- `driver-accepted` - Driver accepted ride request
- `driver-declined` - Driver declined ride request
- `driver-location-update` - Driver location tracking

### WebSocket Rooms

- `user-{userId}` - User-specific notifications
- `driver-{driverId}` - Driver-specific notifications

## Mock Data System

The system includes comprehensive mock data for development:

- **Driver Profiles**: Complete driver information
- **Ride Requests**: Sample ride requests
- **Trip History**: Historical trip data
- **Wallet Data**: Earnings and balance information
- **Notifications**: System notifications

To enable/disable mock data, modify the `useMockData` flag in:

- `colisdav rider/expo/services/riderApi.ts`

## Testing Cross-App Communication

### Test Ride Request Flow

1. Start both apps and backend
2. In user app: Create a ride request
3. In rider app: Check for new ride requests
4. Accept/decline the ride request
5. Verify user app receives driver response

### Test Payment Flow

1. Complete a ride
2. Process payment in user app
3. Verify driver receives payment notification
4. Check wallet balance updates

## Troubleshooting

### Common Issues

1. **Port Already in Use**

   ```bash
   # Kill processes on ports 8081, 8082, 3000
   npx kill-port 8081 8082 3000
   ```

2. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check database credentials in .env
   - Ensure database exists

3. **CORS Errors**
   - Verify backend CORS configuration
   - Check API URLs in frontend .env files
   - Ensure ports match configuration

4. **WebSocket Connection Issues**
   - Check firewall settings
   - Verify Socket.IO client versions
   - Review network connectivity

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=colisdav:*
```

## Production Deployment

### Backend Deployment

1. Build TypeScript files
2. Set up production database
3. Configure environment variables
4. Set up reverse proxy (nginx)
5. Enable SSL certificates

### Mobile App Deployment

1. Build production APK/IPA
2. Configure production API URLs
3. Set up app store accounts
4. Submit for review

## Support

For issues and questions:

- Check the troubleshooting section
- Review API documentation at `/api/docs`
- Check server logs for errors
- Verify all services are running

## License

COLISDAV - All rights reserved
