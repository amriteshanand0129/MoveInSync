const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Ride = require("./models/ride.model");

let clients = new Map();
let activeRides = [];

async function loadActiveRides() {
  try {
    activeRides = await Ride.find({ status: "ACTIVE" }).lean();
    console.log("Loaded active rides from DB:", activeRides.length);
  } catch (error) {
    console.error("Error loading active rides:", error);
  }
}

async function initializeWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("New WebSocket connection established");

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message);

        if (data.action === "authenticate") {
          jwt.verify(data.token, process.env.SECRET, async (err, decoded) => {
            if (err) {
              console.log("WebSocket authentication failed:", err.message);
              ws.send(JSON.stringify({ type: "error", message: "Invalid token" }));
              ws.close();
              return;
            }
          });
          clients.set(ws, {
            pickup_location: data.pickup_location,
            dropoff_location: data.dropoff_location,
            preferences: data.preferences,
          });

          const filteredRides = await filterAndSortRides(data.pickup_location, data.dropoff_location, data.preferences);
          ws.send(JSON.stringify({ type: "rides_available", data: filteredRides }));
        } else if (data.action === "sos_request") {
          jwt.verify(data.token, process.env.SECRET, async (err, decoded) => {
            if (err) {
              console.log("WebSocket authentication failed:", err.message);
              ws.send(JSON.stringify({ type: "error", message: "Invalid token" }));
              ws.close();
              return;
            }

            ws.send(JSON.stringify({ type: "sos_acknowledged", message: "SOS request sent successfully" }));
          });
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    });

    ws.on("close", () => {
      console.log("WebSocket connection closed");
      clients.delete(ws);
    });
  });

  console.log("WebSocket server initialized");
}

// Function to calculate proximity (Haversine formula)
function calculateDistance(loc1, loc2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(loc2.latitude - loc1.latitude);
  const dLon = toRad(loc2.longitude - loc1.longitude);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(loc1.latitude)) * Math.cos(toRad(loc2.latitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Function to calculate matching percentage
function calculateMatchingPercentage(rider, ride) {
  let score = 0;
  let totalCriteria = Object.keys(rider.preferences).length + 2;

  for (let key in rider.preferences) {
    if (ride.ride_preferences && ride.ride_preferences[key] === rider.preferences[key]) {
      score++;
    }
  }

  const pickupDistance = calculateDistance(rider.pickup_location, ride.pickup_location);
  const dropoffDistance = calculateDistance(rider.dropoff_location, ride.dropoff_location);

  if (pickupDistance <= 5) score++;
  if (dropoffDistance <= 5) score++;

  return Math.round((score / totalCriteria) * 100);
}

// Function to filter and sort rides
async function filterAndSortRides(riderPickup, riderDropoff, riderPreferences) {
  const rides = await Ride.find({ status: "ACTIVE" }).lean();

  let filteredRides = rides.map((ride) => {
    const pickupDistance = calculateDistance(riderPickup, ride.pickup_location);
    const dropoffDistance = calculateDistance(riderDropoff, ride.dropoff_location);
    const matchPercentage = calculateMatchingPercentage({ pickup_location: riderPickup, dropoff_location: riderDropoff, preferences: riderPreferences }, ride);

    return { ...ride, match_percentage: matchPercentage, pickup_distance: pickupDistance, dropoff_distance: dropoffDistance };
  });

  filteredRides = filteredRides.filter((ride) => ride.pickup_distance <= 10 && ride.dropoff_distance <= 10);

  return filteredRides.sort((a, b) => b.match_percentage - a.match_percentage);
}
// Broadcast ride updates to riders
async function broadcastRideUpdate(newRide) {
  activeRides.push(newRide);

  for (let [client, data] of clients.entries()) {
    const filteredRides = await filterAndSortRides(data.pickup_location, data.dropoff_location, data.preferences);
    client.send(JSON.stringify({ type: "rides_available", data: filteredRides }));
  }
}

// Update ride and broadcast updates
async function updateRideAndBroadcast(updatedRide) {
  const rideIndex = activeRides.findIndex((ride) => ride._id.toString() === updatedRide._id.toString());

  if (rideIndex !== -1) {
    activeRides[rideIndex] = updatedRide;

    for (let [client, data] of clients.entries()) {
      const filteredRides = await filterAndSortRides(data.pickup_location, data.dropoff_location, data.preferences);
      client.send(JSON.stringify({ type: "rides_available", data: filteredRides }));
    }
  }
}

// Remove ride and broadcast updates
async function removeRideAndBroadcast(rideId) {
  activeRides = activeRides.filter((ride) => ride._id.toString() !== rideId.toString());

  for (let [client, data] of clients.entries()) {
    const filteredRides = await filterAndSortRides(data.pickup_location, data.dropoff_location, data.preferences);
    client.send(JSON.stringify({ type: "rides_available", data: filteredRides }));
  }
}

// Load active rides when server starts
loadActiveRides();

module.exports = { initializeWebSocket, broadcastRideUpdate, updateRideAndBroadcast, removeRideAndBroadcast };
