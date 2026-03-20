const mongoose = require("mongoose");
const Doctor = require("./models/Doctor");
const User = require("./models/User");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const approvedDoctors = await Doctor.updateMany({ status: "pending" }, { status: "approved" });
        console.log("Approved", approvedDoctors.modifiedCount, "doctors.");
        
        await mongoose.connection.collection("users").updateMany({ "role": "doctor" }, { $set: { isApproved: true } });
        console.log("Updated user approval statuses.");
    } catch (e) {
         console.error(e);
    }
    process.exit();
});
