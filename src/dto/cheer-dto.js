import Joi from 'joi';
import { UserProperty } from './user-dto.js';
import { RoomProperty } from './room-dto.js';

export const CheerProperty = {
    // cheerType: 문자열, 필수
    cheerType: Joi.string()
        .required()
        .messages({
            'any.required': 'cheerType이 비어있습니다.',
        }),

    // message
    message: Joi.string()
        .required()
        .messages({
            'any.required': 'message가 비어있습니다.',
        })
}

export const CheerSchema = {
    getCheerMessageDto: Joi.object({
        cheerType: CheerProperty.cheerType
    }),
    postCheerDto: Joi.object({
        userCode: UserProperty.userCode,
        roomId: RoomProperty.roomId,
        cheerType: CheerProperty.cheerType,
        message: CheerProperty.message
    })
}