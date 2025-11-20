require("dotenv").config();

function apiKeyAuth(req, res, next) {
    const sentKey = req.headers["x-api-key"];

    if (!sentKey) {
        return res.status(401).json({ error: "API key required" });
    }

    if (sentKey !== process.env.API_KEY) {
        return res.status(403).json({ error: "Invalid API key" });
    }

    next();
}

module.exports = apiKeyAuth;
