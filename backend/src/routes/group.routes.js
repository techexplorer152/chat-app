import express from "express";
import {
    createGroup,
    getMyGroups,
    joinGroup,
    addUser,
    removeMember,
    deleteGroup
} from "../controllers/group.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/me", authenticate, getMyGroups);
router.post("/", authenticate, createGroup);
router.post("/join/:groupId", authenticate, joinGroup);
router.post("/:groupId/add", authenticate, addUser);

router.delete("/:groupId/members/:userId", authenticate, removeMember);
router.delete("/:groupId", authenticate, deleteGroup);

export default router;