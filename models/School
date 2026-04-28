const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema({
    pin: String
});

const schoolSchema = new mongoose.Schema({
    schoolName: String,
    schoolPin: String,
    expiry: Date,
    grades: {
        grade1: gradeSchema,
        grade2: gradeSchema,
        grade3: gradeSchema,
        grade4: gradeSchema,
        grade5: gradeSchema,
        grade6: gradeSchema,
        grade7: gradeSchema,
        grade8: gradeSchema,
        grade9: gradeSchema,
        grade10: gradeSchema,
        grade11: gradeSchema,
        grade12: gradeSchema
    }
}, { timestamps: true });

module.exports = mongoose.model("School", schoolSchema);