import express from 'express';
import { RoomController } from '../controller/room-controller.js';

const router = express.Router();

// 방 목록 get API
router.get('/', RoomController.getRoomList);
// 방 생성 post API
router.post('/', RoomController.postRoom);
// 방 정보 get API
router.get('/:roomId', RoomController.getRoomInfo);

export default router;