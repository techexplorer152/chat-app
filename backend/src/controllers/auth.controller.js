import { createUser, findUserByEmail } from "../services/user.service.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function register(req, res) {


    try{
        const { email, password ,username} = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({message: "User already exists"});
        }


        const newUser = await createUser({email,password,username});

        //         this is to respond if the process was a success

        const {password: _, ...userData } = newUser;
        return res.status(201).json({
            message: "User registered successfully.",
            user: userData,
        });
    }




    catch(err){
        console.error("Register error:", err);
        res.status(500).json({ message: "Server error." });
    }

}


export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }


        const existingUser = await findUserByEmail(email);
        if (!existingUser) {
            return res.status(400).json({ message: "User does not exist." });
        }


        const validPassword = await bcrypt.compare(password, existingUser.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid credentials." });
        }


        const token = jwt.sign(
            { id: existingUser.id, email: existingUser.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || "1h" }
        );


        const { password: _, ...userData } = existingUser;
        return res.status(200).json({ message: "Login successful.", token, user: userData });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error." });
    }
}