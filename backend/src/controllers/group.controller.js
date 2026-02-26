import * as groupService from "../services/group.service.js";

export async function createGroup(req, res) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "User not authenticated." });
        }

        const { name, description } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Group name is required." });
        }

        const ownerId = parseInt(req.user.id);

        const group = await groupService.createGroupAndAddOwner(
            name.trim(),
            description?.trim() || "",
            ownerId
        );

        res.status(201).json(group);
    } catch (err) {
        console.error("Create group error:", err);
        res.status(500).json({ message: "Failed to create group.", error: err.message });
    }
}

export async function getMyGroups(req, res) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "User not authenticated." });
        }

        const userId = parseInt(req.user.id);

        const groups = await groupService.findGroupsByUserId(userId);

        res.status(200).json(groups);
    } catch (err) {
        console.error("Get my groups error:", err);
        res.status(500).json({ message: "Failed to fetch groups.", error: err.message });
    }
}

export async function joinGroup(req, res) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "User not authenticated." });
        }

        const { groupId } = req.params;
        if (!groupId) {
            return res.status(400).json({ message: "Group ID is required." });
        }

        const membership = await groupService.addUserToGroup(
            parseInt(groupId),
            parseInt(req.user.id)
        );

        res.status(200).json(membership);
    } catch (err) {
        console.error("Join group error:", err);
        res.status(500).json({ message: "Could not join group. You might already be a member.", error: err.message });
    }
}
