import { createUser, findUserByEmail } from "../services/user.service.js";

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