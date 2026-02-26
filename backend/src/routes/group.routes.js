import express from "express";
import { createGroup, getMyGroups, joinGroup } from "../controllers/group.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/me", authenticate, getMyGroups);
router.post("/", authenticate, createGroup);
router.post("/join/:groupId", authenticate, joinGroup);

export default router;