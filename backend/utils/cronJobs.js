const cron = require("node-cron");
const User = require("../models/userModel");
const Vehicle = require("../models/vehicleModel");

function startCronJobs() {
  //for deleting unverified users:
  cron.schedule(
    "0 0 * * *", //runnig everyday at midnight
    // "* * * * * *", //running every second
    async () => {
      try {
        console.log("Checking for expired and unverified users..");

        const result = await User.deleteMany({
          isVerified: false,
          emailVerificationExpires: { $lte: Date.now() },
        });
        if (result.deletedCount > 0)
          console.log(`Deleted ${result.deletedCount} unverified users.`);
      } catch (error) {
        console.error("Error deleting unverified users:", error);
      }
    },
    {
      timezone: "Asia/Kolkata", // Set to IST (Indian Standard Time)
    }
  );

  // //for deleting expired vehicles:
  // cron.schedule(
  //   "0 0 * * *", //runnig everyday at midnight
  //   // "* * * * * *", //running every second
  //   async () => {
  //     console.log("Running vehicle cleanup cron job...");

  //     try {
  //       // Find all expired vehicles
  //       const expiredVehicles = await Vehicle.find({
  //         expiresAt: { $lte: Date.now() },
  //       });

  //       for (const vehicle of expiredVehicles) {
  //         await Vehicle.findByIdAndDelete(vehicle._id); // This will trigger your middleware
  //       }
  //       if (expiredVehicles.length > 0)
  //         console.log(`Deleted ${expiredVehicles.length} expired vehicles.`);
  //     } catch (error) {
  //       console.error("Error during vehicle cleanup:", error);
  //     }
  //   },
  //   {
  //     timezone: "Asia/Kolkata", // Set to IST (Indian Standard Time)
  //   }
  // );

  // cron.schedule("*/10 * * * * *", () => {
  //   console.log("Running task every 10 seconds at", new Date().toISOString());
  // });

  console.log("Cron job initialized.");
}

module.exports = startCronJobs;
