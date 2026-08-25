const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.static("public"));

// ============================================================================
// MARKET SIMULATION
// ============================================================================

const MARKET = {
  MIN: 4.00,
  MAX: 6.00,
  REFERENCE: 4.20
};

let marketState = {
  price: MARKET.REFERENCE,
  previous: MARKET.REFERENCE,
  time: Math.random() * 100,
  timestamp: Date.now()
};

/**
 * GEOMETRIC MARKET FUNCTION
 * Smooth oscillation based on sine waves
 */
function updateMarketPrice() {
  marketState.time += 0.012;

  const wave1 = Math.sin(marketState.time) * 0.42;
  const wave2 = Math.sin(marketState.time * 2.71) * 0.16;
  const wave3 = Math.sin(marketState.time * 0.37) * 0.11;

  marketState.price = 
    MARKET.REFERENCE + 
    wave1 + 
    wave2 + 
    wave3;

  // Keep strictly inside range
  marketState.price = Math.max(
    MARKET.MIN,
    Math.min(MARKET.MAX, marketState.price)
  );

  marketState.timestamp = Date.now();

  return {
    price: marketState.price,
    previous: marketState.previous,
    change: ((marketState.price - marketState.previous) / marketState.previous) * 100,
    timestamp: marketState.timestamp
  };
}

/**
 * Broadcast price update to all connected clients
 */
function broadcastPriceUpdate() {
  const update = updateMarketPrice();
  io.emit("price-update", update);
  marketState.previous = marketState.price;
}

// Start price updates (60ms interval = ~16fps)
setInterval(broadcastPriceUpdate, 60);

// ============================================================================
// SOCKET.IO EVENTS
// ============================================================================

io.on("connection", (socket) => {
  console.log(`✓ Client connected: ${socket.id}`);

  // Send current state immediately on connection
  socket.emit("price-update", {
    price: marketState.price,
    previous: marketState.previous,
    change: 0,
    timestamp: marketState.timestamp
  });

  socket.on("disconnect", () => {
    console.log(`✗ Client disconnected: ${socket.id}`);
  });
});

// ============================================================================
// EXPRESS ROUTES
// ============================================================================

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>BONG$ Market Server</title>
        <style>
          body {
            font-family: monospace;
            background: #0d1219;
            color: #f5f7fa;
            padding: 40px;
            text-align: center;
          }
          h1 { color: #60a5fa; }
          code { 
            background: #1a1f2e; 
            padding: 10px 15px; 
            border-radius: 8px; 
            display: inline-block;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <h1>🔷 BONG$ Market Server</h1>
        <p>Real-time price simulation active</p>
        <code>ws://localhost:3000</code>
        <p>Connect via Socket.io to receive live price updates</p>
      </body>
    </html>
  `);
});

app.get("/api/price", (req, res) => {
  res.json({
    price: marketState.price,
    previous: marketState.previous,
    min: MARKET.MIN,
    max: MARKET.MAX,
    reference: MARKET.REFERENCE,
    timestamp: marketState.timestamp
  });
});

// ============================================================================
// SERVER START
// ============================================================================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`\n🚀 BONG$ Market Server running on port ${PORT}`);
  console.log(`📡 WebSocket: ws://localhost:${PORT}`);
  console.log(`🌐 HTTP: http://localhost:${PORT}\n`);
});
