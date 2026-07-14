const express = require("express");
const FF = require("@pure0cd/freefire-api");

const app = express();
const PORT = process.env.PORT || 3000;

let apiInstance = null;
let session = null;

async function getApi(forceLogin = false) {
    if (!apiInstance) {
        apiInstance = new FF();
    }

    if (!session || forceLogin) {
        session = await apiInstance.login();
    }

    return apiInstance;
}

app.use((req,res,next)=>{
    console.log(
        new Date().toISOString(),
        req.method,
        req.url
    );
    next();
});


app.get("/",(req,res)=>{
    res.send("FF Custom Match API Running");
});


app.get("/health",async(req,res)=>{
    try{
        const api = await getApi();

        res.json({
            success:true,
            login:true
        });

    }catch(e){
        res.json({
            success:false,
            error:e.message
        });
    }
});


app.get("/methods",async(req,res)=>{
    try{
        const api = await getApi();

        res.json({
            methods:
            Object.getOwnPropertyNames(
                Object.getPrototypeOf(api)
            )
        });

    }catch(e){
        res.json({
            error:e.message
        });
    }
});


app.listen(PORT,()=>{
    console.log(
        "Server started on port",
        PORT
    );
});
