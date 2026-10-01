import express from "express";
import { originGuard } from "../admin-routes.js";
import { realtime } from "../server.js";

const router = express.Router();

// ── NEW: Real-Time SSE Endpoints ──────────────────────────────────────
// These endpoints subscribe to Redis channels and keep SSE connection open
// IMPORTANT for load-balanced deployments: clients are tracked in Redis
// sse_clients set. Proper disconnect handling prevents accumulation of
// stale client entries across instances.
router.get("/realtime/birthdays", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Allow-Headers", "Cache-Control");

  // Immediately send current state
  res.write(`event: initial\ndata: {"event":"initial","data":{},"timestamp":${Date.now()}}\n\n`);

  // Track client ID for disconnection cleanup
  const clientId = `sse_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  req.clientId = clientId;

  // Add client to shared Redis set
  realtime.addClient(clientId).catch((err) =>
    console.warn("Redis SSE client add error on open:", err.message)
  );

  // CLEANUP: Remove client when connection closes (disconnects, refresh, etc.)
  res.on("close", () => {
    realtime.removeClient(req.clientId).catch((err) =>
      console.warn("Redis SSE client remove error on close:", err.message)
    );
    console.log(`SSE connection closed for birthdays (client: ${req.clientId})`);
  });

  console.log("SSE connection opened for birthdays");
});

router.get("/realtime/anniversaries", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Allow-Headers", "Cache-Control");

  // Immediately send current state
  res.write(`event: initial\ndata: {"event":"initial","data":{},"timestamp":${Date.now()}}\n\n`);

  // Track client ID for disconnection cleanup
  const clientId = `sse_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  req.clientId = clientId;

  // Add client to shared Redis set
  realtime.addClient(clientId).catch((err) =>
    console.warn("Redis SSE client add error on open:", err.message)
  );

  // CLEANUP: Remove client when connection closes (disconnects, refresh, etc.)
  res.on("close", () => {
    realtime.removeClient(req.clientId).catch((err) =>
      console.warn("Redis SSE client remove error on close:", err.message)
    );
    console.log(`SSE connection closed for anniversaries (client: ${req.clientId})`);
  });

  console.log("SSE connection opened for anniversaries");
});

export default router;