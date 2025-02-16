// Controllers and Middlewares
const vehicle_controller = require("../controllers/vehicle.controller");
const auth_middleware = require("../middlewares/auth.middleware");
const vehicle_middleware = require("../middlewares/vehicle.middleware");

// Vehicle Routes
module.exports = (app) => {
  app.post("/vehicle/register", [auth_middleware.validateToken, auth_middleware.isDriver, vehicle_middleware.validateVehicleRegistrationBody], vehicle_controller.registerVehicle);
//   app.get("/vehicle/all", [auth_middleware.validateToken, auth_middleware.isAdmin], vehicle_controller.findAllVehicles);
  app.put("/vehicle/update/:id", [auth_middleware.validateToken, auth_middleware.isDriver, vehicle_middleware.validateVehicleUpdateBody], vehicle_controller.updateVehicle);
};