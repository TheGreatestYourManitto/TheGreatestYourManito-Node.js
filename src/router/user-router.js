import express from 'express';
import { UserController } from '../controller/user-controller.js';

const router = express.Router();

// 유저 생성 API
router.post('/', UserController.postUser);
// 유저 체크 API
router.post('/identify', UserController.postIdentifyUser);

export default router;