import express from 'express';
import { createUserController } from '../controller/user-controller.js';

const router = express.Router();

// 유저 생성 API
router.post('/', createUserController);

export default router;