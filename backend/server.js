const dotenv = require("dotenv");
const mongoose = require("mongoose");
const startCronJobs = require("./utils/cronJobs");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION:");
  console.log(err.name, "\n", err.message, "\n", err.stack);
  console.log("server closing...");
  process.exit(1);
});

dotenv.config({ path: ".env" });

const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log("Database connection is successful");
  startCronJobs();
});

// console.log(process.env);
// console.log(app.get('env'));

const port = process.env.PORT || 3000;
const server = app.listen(port, (req, res) => {
  console.log(`app is running on port ${port}`);
});

// console.log(x);

//the following is executed if a promise is rejected and is not handled:
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED ERROR:");
  console.log(err.name, "\n", err.message);
  console.log("server closing...");
  server.close(() => {
    process.exit(1);
  });
});
