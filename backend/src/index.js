import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json())

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {

    res.send("This is a Test")
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}!...`);
});

