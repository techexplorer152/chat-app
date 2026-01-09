import express from 'express';
import { getAllMessages, createMessage } from '../controllers/message.controller.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();


router.get('/', getAllMessages);


router.post('/text', createMessage);


router.post('/', upload.single('image'), createMessage);

export default router;
