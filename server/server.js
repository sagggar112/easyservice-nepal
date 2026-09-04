require("dotenv").config();

const app = require("./src/app");
require("./src/config/db");

const listEndpoints = require("express-list-endpoints");

console.log(listEndpoints(app));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});