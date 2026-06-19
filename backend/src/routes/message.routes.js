import express from "express";
import {
    getAllMessages,
    createMessage,
    deleteMessage,
    getGroupMessagesController
} from "../controllers/message.controller.js";
import { upload } from "../middleware/upload.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, getAllMessages);
router.get("/group/:groupId", authenticate, getGroupMessagesController);
router.post("/", authenticate, upload.single("image"), createMessage);
router.delete("/:id", authenticate, deleteMessage);

export default router;