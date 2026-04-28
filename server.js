const jwt = require("jsonwebtoken");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const schoolRoutes = require("./routes/schools");
app.use("/api/schools", schoolRoutes);

app.get("/", (req, res) => {
    res.send("GCR Backend Running");
});

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("MongoDB Connected");
        app.listen(5000, () => {
            console.log("Server running on port 5000");
        });
    })
    .catch(err => {
        console.error("Failed to connect to MongoDB:", err.message);
        process.exit(1);
    });

    function authMiddleware(req, res, next) {
    const header = req.headers["authorization"];
    if (!header) return res.status(401).json({ message: "No token" });

    const token = header.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}