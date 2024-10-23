import express from 'express';
import { CheerController } from '../controller/cheer-controller.js';

const router = express.Router();

// 응원 타입 별 응원 메세지 get API
router.get('/:type/message', CheerController.getCheerMessage);
// 마니또의 응원 보내기 post API
router.post('/', CheerController.postCheer);

export default router;