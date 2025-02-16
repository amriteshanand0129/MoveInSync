// Controllers and Middlewares
const auth_middleware = require("../middlewares/auth.middleware");
const ride_controller = require("../controllers/ride.controller");
const ride_middleware = require("../middlewares/ride.middleware");
 
module.exports = (app) => {
  app.post("/ride/create", [auth_middleware.validateToken, auth_middleware.isDriver, ride_middleware.checkRideCreationRequest], ride_controller.registerRide);
  app.post("/ride/start/:ride_id", [auth_middleware.validateToken, auth_middleware.isDriver], ride_controller.startRide);
  app.post("/ride/finish/:ride_id", [auth_middleware.validateToken, auth_middleware.isDriver], ride_controller.finishRide);
  app.post("/ride/cancel/:ride_id", [auth_middleware.validateToken, auth_middleware.isDriver], ride_controller.cancelRide);
  app.post("/ride/requestRide/:ride_id", [auth_middleware.validateToken, auth_middleware.isRider], ride_controller.requestRide);
  app.post("/ride/acceptRideRequest/:ride_id/:passenger_id", [auth_middleware.validateToken, auth_middleware.isDriver], ride_controller.acceptRideRequest);
  app.get("/ride/details/:ride_id", [auth_middleware.validateToken], ride_controller.getRideDetails);
};
