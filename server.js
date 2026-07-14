const express = require("express");
const FF = require("@pure0cd/freefire-api");

const app = express();
const PORT = process.env.PORT || 3000;

let apiInstance = null;
let session = null;

// Updated Helper to handle auto-login and session refresh
async function getApi(forceLogin = false) {
    if (!apiInstance) {
        apiInstance = new FF();
    }
    if (!session || forceLogin) {
        try {
            session = await apiInstance.login();
        } catch (e) {
            session = null;
            throw new Error("Login failed: " + e.message);
        }
    }
    return apiInstance;
}

// Middleware for logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Wrapper to handle endpoint logic with auto-retry on session expiry
async function executeWithRetry(res, action) {
    try {
        const api = await getApi();
        return await action(api);
    } catch (e) {
        // Retry logic: If session error occurs, force re-login and try once more
        if (e.message.toLowerCase().includes("session") || e.message.toLowerCase().includes("token")) {
            try {
                const api = await getApi(true);
                return await action(api);
            } catch (retryError) {
                return res.status(500).json({ success: false, error: "Retry failed: " + retryError.message });
            }
        }
        return res.status(500).json({ success: false, error: e.message });
    }
}

app.get("/", (req, res) => res.send("FF API Test Server Running"));

app.get("/ping", (req, res) => res.json({ status: "online", timestamp: new Date() }));

app.get("/health", async (req, res) => {
    try {
        const api = await getApi();
        res.json({
            success: true,
            loggedIn: !!session,
            methods: Object.getOwnPropertyNames(Object.getPrototypeOf(api))
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.get("/version", (req, res) => {
    res.json({ nodeVersion: process.version, library: "@pure0cd/freefire-api" });
});

app.get("/test", (req, res) => {
    try {
        res.json({ success: true, message: "Library Loaded Successfully", exports: Object.keys(FF) });
    } catch (e) {
        res.json({ success: false, error: e.message });
    }
});

app.get("/module", (req, res) => res.json({ type: typeof FF }));

app.get("/inspect", (req, res) => {
    try {
        const api = new FF();
        res.json({
            objectType: typeof api,
            ownProperties: Object.getOwnPropertyNames(api),
            prototypeMethods: Object.getOwnPropertyNames(Object.getPrototypeOf(api))
        });
    } catch (e) {
        res.json({ success: false, error: e.message });
    }
});

app.get("/login-info", (req, res) => {
    const api = new FF();
    res.json({
        loginArguments: api.login.length,
        searchAccountArguments: api.searchAccount.length,
        getPlayerProfileArguments: api.getPlayerProfile.length,
        getPlayerItemsArguments: api.getPlayerItems.length,
        getPlayerStatsArguments: api.getPlayerStats.length
    });
});

app.get("/source", (req, res) => {
    const api = new FF();
    res.json({
        login: api.login.toString(),
        searchAccount: api.searchAccount.toString(),
        getPlayerProfile: api.getPlayerProfile.toString(),
        getPlayerItems: api.getPlayerItems.toString(),
        getPlayerStats: api.getPlayerStats.toString()
    });
});

app.get("/login-test", async (req, res) => {
    try {
        const api = new FF();
        const s = await api.login();
        session = s;
        res.json({ success: true, session: s });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.get("/session", (req, res) => res.json({ session: session || null }));

app.get("/search", async (req, res) => {
    const name = req.query.name;
    if (!name) return res.status(400).json({ error: "Missing name" });
    await executeWithRetry(res, async (api) => res.json(await api.searchAccount(name)));
});

app.get("/profile", async (req, res) => {
    const uid = req.query.uid;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    await executeWithRetry(res, async (api) => res.json(await api.getPlayerProfile(uid)));
});

app.get("/items", async (req, res) => {
    const uid = req.query.uid;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    await executeWithRetry(res, async (api) => res.json(await api.getPlayerItems(uid)));
});

app.get("/stats", async (req, res) => {
    const uid = req.query.uid;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    await executeWithRetry(res, async (api) => res.json(await api.getPlayerStats(uid, "br", "career")));
});

app.get("/stats-ranked", async (req, res) => {
    await executeWithRetry(res, async (api) => res.json(await api.getPlayerStats(req.query.uid, "br", "ranked")));
});

app.get("/stats-normal", async (req, res) => {
    await executeWithRetry(res, async (api) => res.json(await api.getPlayerStats(req.query.uid, "br", "normal")));
});

app.get("/cs", async (req, res) => {
    await executeWithRetry(res, async (api) => res.json(await api.getPlayerStats(req.query.uid, "cs", "career")));
});

app.get("/cs-ranked", async (req, res) => {
    await executeWithRetry(res, async (api) => res.json(await api.getPlayerStats(req.query.uid, "cs", "ranked")));
});

app.get("/cs-normal", async (req, res) => {
    await executeWithRetry(res, async (api) => res.json(await api.getPlayerStats(req.query.uid, "cs", "normal")));
});

app.get("/all", async (req, res) => {
    const uid = req.query.uid;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    await executeWithRetry(res, async (api) => {
        const [profile, items, br, cs] = await Promise.all([
            api.getPlayerProfile(uid),
            api.getPlayerItems(uid),
            api.getPlayerStats(uid, "br", "career"),
            api.getPlayerStats(uid, "cs", "career")
        ]);
        res.json({ profile, items, br, cs });
    });
});

app.listen(PORT, () => {
    console.log(`Server Started on port ${PORT}`);
});
