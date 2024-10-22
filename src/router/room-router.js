import express from 'express';
import { RoomController } from '../controller/room-controller.js';

const router = express.Router();

// 방 체크 API
router.get('/', RoomController.getRoom);
// 방 생성 API
router.post('/', RoomController.postRoom);

export default router;