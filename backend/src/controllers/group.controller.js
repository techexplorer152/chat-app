import * as groupService from "../services/group.service.js";

export async function createGroup(req, res) {
    try {
        const { name, description } = req.body;
        const ownerId = req.user.id;

        if (!name) return res.status(400).json({ message: "Group name is required." });

        const group = await groupService.createGroupAndAddOwner(name, description, ownerId);
        res.status(201).json(group);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create group." });
    }
}

export async function getMyGroups(req, res) {
    try {
        const userId = req.user.id;
        const groups = await groupService.findGroupsByUserId(userId);
        res.status(200).json(groups);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch groups." });
    }
}

export async function joinGroup(req, res) {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        const membership = await groupService.addUserToGroup(groupId, userId);
        res.status(200).json(membership);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Could not join group. You might already be a member." });
    }
}