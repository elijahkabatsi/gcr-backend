const express = require("express");
const router = express.Router();
const School = require("../models/school");
const jwt = require("jsonwebtoken");

// LOGIN
router.post("/login", async (req, res) => {
    const { schoolName, username, password } = req.body;

    const school = await School.findOne({ schoolName });
    if (!school) return res.status(404).json({ message: "School not found" });

    const today = new Date();
    if (today > new Date(school.expiry))
        return res.status(403).json({ message: "Subscription expired" });

    // Owner login
    if (username === "admin") {
        if (password !== school.schoolPin)
            return res.status(401).json({ message: "Wrong PIN" });

        const token = jwt.sign(
            { role: "school", school: schoolName },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );
        return res.json({ token, role: "school", school: schoolName });
    }

    // Grade login
    const grade = school.grades[username];
    if (!grade) return res.status(404).json({ message: "Grade not found" });
    if (grade.pin !== password)
        return res.status(401).json({ message: "Wrong PIN" });

    const token = jwt.sign(
        { role: "grade", school: schoolName, grade: username },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
    );
    return res.json({ token, role: "grade", school: schoolName, grade: username });
});

// GET ALL SCHOOLS
router.get("/", async (req, res) => {
    try {
        const schools = await School.find().sort({ createdAt: -1 });
        res.json(schools);
    } catch (error) {
        res.status(500).json({ message: "Failed to load schools" });
    }
});

// CREATE SCHOOL
router.post("/", async (req, res) => {
    try {
        const { schoolName, expiry } = req.body;

        if (!schoolName || !expiry) {
            return res.status(400).json({ message: "School name and expiry required" });
        }

        const schoolPin = Math.floor(10000 + Math.random() * 90000).toString();

        let grades = {};
        for (let i = 1; i <= 12; i++) {
            grades["grade" + i] = { pin: "" };
        }

        const newSchool = new School({ schoolName, expiry, schoolPin, grades });
        await newSchool.save();

        res.status(201).json(newSchool);

    } catch (error) {
        res.status(500).json({ message: "Failed to create school" });
    }
});

// RENEW SCHOOL (+30 DAYS)
router.put("/:id/renew", async (req, res) => {
    try {
        const future = new Date();
        future.setDate(future.getDate() + 30);

        const school = await School.findById(req.params.id);
        if (!school) return res.status(404).json({ message: "School not found" });

        school.expiry = future;
        await school.save();

        res.json(school);

    } catch (error) {
        res.status(500).json({ message: "Failed to renew school" });
    }
});

// RESET ALL GRADE PINS TO 12345
router.put("/:id/reset", async (req, res) => {
    try {
        const school = await School.findById(req.params.id);
        if (!school) return res.status(404).json({ message: "School not found" });

        for (let i = 1; i <= 12; i++) {
            school.grades["grade" + i].pin = "12345";
        }

        school.markModified("grades");
        await school.save();

        res.json({ message: "Pins reset", school });

    } catch (error) {
        res.status(500).json({ message: "Failed to reset pins" });
    }
});

// UPDATE ALL GRADE PINS
router.put("/:id/pins", async (req, res) => {
    try {
        const { grades } = req.body;
        const school = await School.findById(req.params.id);
        if (!school) return res.status(404).json({ message: "School not found" });

        for (let i = 1; i <= 12; i++) {
            school.grades["grade" + i].pin = grades["grade" + i].pin;
        }

        school.markModified("grades");
        await school.save();

        res.json(school);

    } catch (error) {
        res.status(500).json({ message: "Failed to update pins" });
    }
});

// DELETE SCHOOL
router.delete("/:id", async (req, res) => {
    try {
        const school = await School.findByIdAndDelete(req.params.id);
        if (!school) return res.status(404).json({ message: "School not found" });

        res.json({ message: "School deleted" });

    } catch (error) {
        res.status(500).json({ message: "Failed to delete school" });
    }
});

module.exports = router;