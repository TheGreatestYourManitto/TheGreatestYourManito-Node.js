import express from 'express';
import { RoomController } from '../controller/room-controller.js';

const router = express.Router();

// 방 체크 API
router.get('/', RoomController.getRoom);


export default router;