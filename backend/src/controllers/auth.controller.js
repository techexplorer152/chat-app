import {
    findUserByEmail,
    createUser,
    hashPassword,
    comparePassword,
    generateToken,
    generateRefreshToken,
} from "../services/auth.service.js";

export async function register(req, res) {
    try {
        const { email, username, password } = req.body;
        if (!email || !username || !password)
            return res.status(400).json({ message: "All fields are required." });

        const existingUser = await findUserByEmail(email);
        if (existingUser)
            return res.status(400).json({ message: "User already exists." });

        const hashedPassword = await hashPassword(password);
        const newUser = await createUser({ email, username, password: hashedPassword });

        const accessToken = generateToken(newUser);
        const refreshToken = generateRefreshToken(newUser);


        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const { password: _, ...userData } = newUser;
        res.status(201).json({ message: "User registered.", user: userData, token: accessToken });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "All fields are required." });

        const user = await findUserByEmail(email);
        if (!user) return res.status(400).json({ message: "User does not exist." });

        const valid = await comparePassword(password, user.password);
        if (!valid) return res.status(400).json({ message: "Invalid credentials." });

        const accessToken = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const { password: _, ...userData } = user;
        res.status(200).json({ message: "Login successful.", token: accessToken, user: userData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
}

export async function refresh(req, res) {
    try {
        const token = req.cookies.refreshToken;
        if (!token) return res.status(401).json({ message: "No refresh token provided." });

        jwt.verify(token, process.env.REFRESH_SECRET, async (err, decoded) => {
            if (err) return res.status(403).json({ message: "Invalid refresh token." });

            const user = await findUserById(decoded.id);
            if (!user) return res.status(404).json({ message: "User not found." });

            const newAccessToken = generateToken(user);
            res.status(200).json({ token: newAccessToken });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
}

export async function logout(req, res) {
    res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" });
    res.status(200).json({ message: "Logged out successfully." });
}
