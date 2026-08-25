# BONG$ Market Server

Real-time synchronized market simulation with WebSocket streaming.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Start the server
```bash
npm start
```

Server runs on `http://localhost:3000`

### 3. Open the client
Open `client.html` in your browser at `http://localhost:3000/client.html`

## Architecture

- **server.js**: Node.js + Express + Socket.io server that runs the price simulation
- **client.html**: Browser client that connects via WebSocket and displays real-time updates

## Troubleshooting

### "CONNECTING..." stuck
1. Make sure server is running: `npm start`
2. Check if port 3000 is available
3. Open browser console (F12) and look for errors
4. Try accessing `http://localhost:3000` to verify server is running

### CORS Issues
If you get CORS errors, the client URL and server URL don't match:
- Edit `client.html` line ~215 and change `SERVER_URL` to match your server location
- Example: `const SERVER_URL = "http://your-server-address:3000";`

### Network Issues
- If running on different machines, replace `localhost` with the server's IP address
- Example: `const SERVER_URL = "http://192.168.1.100:3000";`

## API

### WebSocket Events

**price-update** (from server)
```javascript
{
  price: 4.24,           // Current price
  previous: 4.20,        // Previous price
  change: 0.95,          // Percentage change
  timestamp: 1234567890  // Server timestamp
}
```

### HTTP Endpoints

**GET /api/price**
```json
{
  "price": 4.24,
  "previous": 4.20,
  "min": 4.00,
  "max": 6.00,
  "reference": 4.20,
  "timestamp": 1234567890
}
```

## Development

Run with auto-reload:
```bash
npm run dev
```

Requires `nodemon` (included in devDependencies).
