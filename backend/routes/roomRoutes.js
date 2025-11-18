import express from 'express';
import { roomController } from '../controllers/roomController.js';

const router = express.Router();

router.get('/status', roomController.getRoomStatus);

export default router;