require("dotenv").config({ path: "./config/.env" });

const express = require("express");
const cors = require("cors");
const connectDB = require("./database/connection");

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/sensor", require("./routes/sensor"));
app.use("/api/door", require("./routes/door"));
app.use("/api/alert", require("./routes/alert"));

app.get("/", (req, res) => {
  res.json({ message: "SmartHome Nibba IoT Backend running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
