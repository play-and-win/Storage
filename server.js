const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("FF API Test Server Running");
});

app.get("/test", async (req, res) => {

    try {

        const ff = require("@pure0cd/freefire-api");

        res.json({
            success: true,
            message: "Library Loaded Successfully",
            exports: Object.keys(ff)
        });

    } catch (e) {

        res.json({
            success: false,
            error: e.message
        });

    }

});

// NEW TEST ENDPOINT
app.get("/module", (req, res) => {

    try {

        const ff = require("@pure0cd/freefire-api");

        res.json({
            type: typeof ff,
            module: ff
        });

    } catch (e) {

        res.json({
            success: false,
            error: e.message
        });

    }

});

app.listen(PORT, () => {
    console.log("Server Started");
});
