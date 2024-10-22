import { ConstantResponseStatus, StatusCodes } from '../../common/index.js';
import { sendResponse, throwError } from '../../common/response-helper.js';
import asyncHandler from 'express-async-handler';
import { RoomSchema } from '../dto/room-dto.js';
import { createRoom, searchRoom } from '../service/room-service.js';

export const RoomController = {
    getRoom: asyncHandler(async (req, res) => {
        const { error, value } = RoomSchema.getRoomDto.validate({ userCode: req.get('userCode') });
        if (error) { throwError(StatusCodes.BAD_REQUEST, error.details[0].message); }
        const { userCode } = value;
        const roomList = await searchRoom(userCode);
        return sendResponse(res, ConstantResponseStatus.SUCCESS, { "rooms": roomList });
    }),
    postRoom: asyncHandler(async (req, res) => {
        const { error, value } = RoomSchema
        if (error) { throwError(StatusCodes.BAD_REQUEST, error.details[0].message); }
        const { userCode, roomName, endDate } = value;
        const invitationCode = await createRoom(userCode, roomName, endDate);
        return sendResponse(res, ConstantResponseStatus.CREATED, { "invitationCode": invitationCode });
    })
};