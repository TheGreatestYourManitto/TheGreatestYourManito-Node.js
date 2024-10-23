import { ConstantResponseStatus, StatusCodes } from '../../common/index.js';
import { sendResponse, throwError } from '../../common/response-helper.js';
import asyncHandler from 'express-async-handler';
import { RoomSchema } from '../dto/room-dto.js';
import { createRoom, searchRoom, searchRoomInfo } from '../service/room-service.js';

export const RoomController = {
    getRoomList: asyncHandler(async (req, res) => {
        const { error, value } = RoomSchema.getRoomListDto.validate({ userCode: req.get('userCode') });
        if (error) { throwError(StatusCodes.BAD_REQUEST, error.details[0].message); }
        const { userCode } = value;
        const roomList = await searchRoom(userCode);
        const filteredRooms = roomList.map(room => ({
            roomId: room.id,
            roomName: room.room_name,
            endDate: room.end_date
        }));
        return sendResponse(res, ConstantResponseStatus.SUCCESS, { "rooms": filteredRooms });
    }),
    postRoom: asyncHandler(async (req, res) => {
        const { error, value } = RoomSchema.postRoomDto.validate({ userCode: req.get('userCode'), roomName: req.body.roomName, endDate: req.body.endDate });
        if (error) { throwError(StatusCodes.BAD_REQUEST, error.details[0].message); }
        const { userCode, roomName, endDate } = value;
        const invitationCode = await createRoom(userCode, roomName, endDate);
        return sendResponse(res, ConstantResponseStatus.CREATED, { "invitationCode": invitationCode });
    }),
    getRoomInfo: asyncHandler(async (req, res) => {
        const { error, value } = RoomSchema.getRoomInfoDto.validate({ userCode: req.get('userCode'), roomId: req.params.roomId });
        if (error) { throwError(StatusCodes.BAD_REQUEST, error.details[0].message); }
        const { userCode, roomId } = value;
        const result = await searchRoomInfo(userCode, roomId);
        return sendResponse(res, ConstantResponseStatus.SUCCESS, { "isAdmin": result.isAdmin, "invitationCode": result.invitation_code, "member": result.members });
    })
};