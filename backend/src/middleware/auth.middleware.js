import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
    try {
        const token = req.cookies?.accessToken;
        if (!token) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}
