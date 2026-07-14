const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;


// HOME
app.get("/", (req, res) => {

    res.send("FF API Test Server Running");

});


// TEST LIBRARY
app.get("/test", (req, res) => {

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


// CHECK MODULE TYPE
app.get("/module", (req, res) => {

    try {

        const FF = require("@pure0cd/freefire-api");

        res.json({
            type: typeof FF
        });

    } catch (e) {

        res.json({
            error: e.message
        });

    }

});


// INSPECT LIBRARY
app.get("/inspect", (req, res) => {

    try {

        const FF = require("@pure0cd/freefire-api");

        let obj;

        try {

            obj = new FF();

        } catch (e) {

            obj = FF;

        }

        res.json({

            objectType: typeof obj,

            ownProperties: Object.getOwnPropertyNames(obj),

            prototypeMethods: Object.getOwnPropertyNames(
                Object.getPrototypeOf(obj)
            )

        });

    } catch (e) {

        res.json({

            success: false,

            error: e.message,

            stack: e.stack

        });

    }

});


app.listen(PORT, () => {

    console.log("Server Started");

});
