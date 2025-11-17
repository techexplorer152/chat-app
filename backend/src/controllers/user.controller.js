import { getAllUsers } from "../services/user.service.js";

export async function getUsers(req, res) {
    try{
        const users = await getAllUsers();
        res.json(users);
    }
    catch(err){
        console.error("Failed to fetch users:", err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
}