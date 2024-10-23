import Joi from 'joi';
import { UserProperty } from './user-dto.js';

export const RoomProperty = {
    // roomId: 숫자, 필수
    roomId: Joi.number()
        .integer()
        .required()
        .messages({
            'number.base': 'roomId는 숫자여야 합니다.',
            'any.required': 'roomId가 비어있습니다.',
        }),

    // invitationCode: 최대 8자 이하 문자열, 필수
    invitationCode: Joi.string()
        .max(8)
        .required()
        .messages({
            'string.max': 'invitationCode는 최대 8자 이하만 가능합니다.',
            'any.required': 'invitationCode가 비어있습니다.',
        }),

    // adminUserId: 숫자, 필수
    adminUserId: Joi.number()
        .integer()
        .required()
        .messages({
            'number.base': 'adminUserId는 숫자여야 합니다.',
            'any.required': 'adminUserId가 비어있습니다.',
        }),

    // roomName: 최대 4? 10자 이하 문자열, 필수
    roomName: Joi.string()
        .max(40) // 10자인지 40자인지 체크 필요
        .required()
        .messages({
            'string.max': 'roomName은 최대 10자 이하만 가능합니다.',
            'any.required': 'roomName이 비어있습니다.',
        }),

    // isConfirmed: boolean, 필수
    isConfirmed: Joi.boolean()
        .required()
        .messages({
            'boolean.base': 'isConfirmed는 boolean 값이어야 합니다.',
            'any.required': 'isConfirmed가 비어있습니다.',
        }),

    // endDate: ISO 8601 형식, 필수
    endDate: Joi.date()
        .iso()
        .required()
        .messages({
            'date.format': 'endDate는 ISO 8601 형식을 따라야 합니다.',
            'any.required': 'endDate가 비어있습니다.',
        }),
};

export const RoomSchema = {
    getRoomListDto: Joi.object({
        userCode: UserProperty.userCode
    }),
    postRoomDto: Joi.object({
        userCode: UserProperty.userCode,
        roomName: RoomProperty.roomName,
        endDate: RoomProperty.endDate
    }),
    getRoomInfoDto: Joi.object({
        userCode: UserProperty.userCode,
        roomId: RoomProperty.roomId
    }),
    postRoomParticipateDto: Joi.object({
        userCode: UserProperty.userCode,
        invitationCode: RoomProperty.invitationCode
    }),
    deleteRoomMemberDto: Joi.object({
        userCode: UserProperty.userCode,
        roomId: RoomProperty.roomId,
        userId: UserProperty.userId
    }),
    patchRoomStatusDto: Joi.object({
        userCode: UserProperty.userCode,
        roomId: RoomProperty.roomId
    }),
    deleteRoomDto: Joi.object({
        userCode: UserProperty.userCode,
        roomId: RoomProperty.roomId
    })
};