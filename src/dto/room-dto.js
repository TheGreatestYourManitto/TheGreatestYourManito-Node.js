import Joi from 'joi';
import { UserProperty } from './user-dto.js';

export const RoomProperty = {};

export const RoomSchema = {
    getRoomDto: Joi.object({
        userCode: UserProperty.userCode
    })
};