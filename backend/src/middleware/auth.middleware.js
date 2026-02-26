import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
    try {
        const token =
            req.cookies?.accessToken ||
            req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "Not authenticated. Token missing." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded?.id) {
            return res.status(401).json({ error: "Invalid token. Missing user ID." });
        }

        req.user = {
            id: parseInt(decoded.id),
            email: decoded.email,
        };

        next();
    } catch (err) {
        console.error("Authentication error:", err.message);
        return res.status(401).json({ error: "Invalid or expired token." });
    }
}
