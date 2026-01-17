import express from 'express';
import { getAllMessages, createMessage, deleteMessage } from '../controllers/message.controller.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

router.get('/', getAllMessages);

router.post('/', upload.single('image'), createMessage);

router.delete('/:id', deleteMessage);

export default router;