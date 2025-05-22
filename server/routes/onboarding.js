const express = require("express");
const router = express.Router();
const User = require("../models/User");

//middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()){
        return next(); //protect the route from unauthenticated users
    }
    res.state(401).json({ error: "Not Authenticated" }); //send json msg back to client
};

// Get onboarding status
router.get("/", isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user.onboarding);
    } catch (error) {
        res.status(500).json({ error: "Error fetching onboarding status"});
    }
});

// Update onboarding data
router.post("/", isAuthenticated, async (req, res) => {
    try {
        const { reason, goal, school, username, peers } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    username: username,
                    onboardingInfo: {
                        reason,
                        goal,
                        school,
                        peers
                    }
                }
            },
            { new: true}
        );
        res.json({ message: "Onboarding data successfully updated" });
    } catch (error) {
        res.status(500).json({ error: "error updating onboarding data"});
    }
});

module.exports = router;