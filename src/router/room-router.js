import express from 'express';
import { RoomController } from '../controller/room-controller.js';

const router = express.Router();

// 방 목록 get API
router.get('/', RoomController.getRoomList);
// 방 생성 post API
router.post('/', RoomController.postRoom);
// 방 정보 get API
router.get('/:roomId', RoomController.getRoomInfo);
// 방 참여 post API
router.post('/participate', RoomController.postRoomParticipate);
// 방 멤버 삭제 delete API
router.delete('/:roomId/member/:userId', RoomController.deleteRoomMember);
// 방 상태 확정 patch API
router.patch('/:roomId', RoomController.patchRoomStatus);
// 방의 마니또 상대 확인 get API
router.get('/:roomId/receiver', RoomController.getManittoReceiver);

export default router;