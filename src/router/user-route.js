import express from 'express';
import { tempTest, tempException } from '../controller/user-controller.js';

export const tempRouter = express.Router();

tempRouter.get('/test', tempTest);
tempRouter.get('/exception/:flag', tempException);

// user.route.js

import express from "express";
import asyncHandler from 'express-async-handler';

import { userSignin } from "../controllers/user.controller.js";

export const userRouter = express.Router();

userRouter.post('/signin', asyncHandler(userSignin));