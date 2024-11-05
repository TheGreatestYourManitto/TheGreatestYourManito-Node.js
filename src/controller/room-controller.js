import { ConstantResponseStatus, StatusCodes } from '../../common/index.js';
import { sendResponse, throwError } from '../../common/response-helper.js';
import asyncHandler from 'express-async-handler';
import { RoomSchema } from '../dto/room-dto.js';
import { confirmRoomStatus, createRoom, getManittoResult, participateRoom, removeRoom, removeRoomMember, searchManitto, searchRoom, searchRoomBy, searchRoomInfo } from '../service/room-service.js';

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
        const room = await createRoom(userCode, roomName, endDate);
        return sendResponse(res, ConstantResponseStatus.CREATED, { "invitationCode": room.invitationCode, "endDate": room.endDate });
    }),
    getRoomInfo: asyncHandler(async (req, res) => {
        const { error, value } = RoomSchema.getRoomInfoDto.validate({ userCode: req.get('userCode'), roomId: req.params.roomId });
        if (error) { throwError(StatusCodes.BAD_REQUEST, error.details[0].message); }
        const { userCode, roomId } = value;
        const result = await searchRoomInfo(userCode, roomId);
        return sendResponse(res, ConstantResponseStatus.SUCCESS, { "isAdmin": result.isAdmin, "invitationCode": result.invitation_code, "member": result.members });
    }),
    postRoomParticipate: asyncHandler(async (req, res) => {
        const { error, value } = RoomSchema.postRoomParticipateDto.validate({ userCode: req.get('userCode'), invitationCode: req.body.invitationCode });
        if (error) { throwError(StatusCodes.BAD_REQUEST, error.details[0].message); }
        const { userCode, invitationCode } = value;
        await participateRoom(userCode, invitationCode);
        return sendResponse(res, ConstantResponseStatus.CREATED);
    }),
    deleteRoomMember: asyncHandler(async (req, res) => {
        const { error, value } = RoomSchema.deleteRoomMemberDto.validate({ userCode: req.get('userCode'), roomId: req.params.roomId, userId: req.params.userId });
        if (error) { throwError(StatusCodes.BAD_REQUEST, error.details[0].message); }
        const { userCode, roomId, userId } = value;
        await removeRoomMember(userCode, roomId, userId);
        return sendResponse(res, ConstantResponseStatus.SUCCESS);
    }),
    patchRoomStatus: asyncHandler(async (req, res) => {
        const { error, value } = RoomSchema.getRoomInfoDto.validate({ userCode: req.get('userCode'), roomId: req.params.roomId });
        if (error) { throwError(StatusCodes.BAD_REQUEST, error.details[0].message); }
        const { userCode, roomId } = value;
        await confirmRoomStatus(userCode, roomId);
        return sendResponse(res, ConstantResponseStatus.SUCCESS);
    }),
    getManittoReceiver: asyncHandler(async (req, res) => {
        const { error, value } = RoomSchema.getRoomInfoDto.validate({ userCode: req.get('userCode'), roomId: req.params.roomId });
        if (error) { throwError(StatusCodes.BAD_REQUEST, error.details[0].message); }
        const { userCode, roomId } = value;
        const user = await searchManitto(userCode, roomId);
        const room = await searchRoomBy(roomId);
        console.log(room);
        return sendResponse(res, ConstantResponseStatus.SUCCESS, { "receiver": { "userName": user.nickname, "userId": user.id }, "endDate": room.end_date });
    }),
    getRoomResult: asyncHandler(async (req, res) => {
        const { error, value } = RoomSchema.getRoomInfoDto.validate({ userCode: req.get('userCode'), roomId: req.params.roomId });
        if (error) { throwError(StatusCodes.BAD_REQUEST, error.details[0].message); }
        const { userCode, roomId } = value;
        const result = await getManittoResult(userCode, roomId);
        return sendResponse(res, ConstantResponseStatus.SUCCESS, result);
    }),
    deleteRoom: asyncHandler(async (req, res) => {
        const { error, value } = RoomSchema.getRoomInfoDto.validate({ userCode: req.get('userCode'), roomId: req.params.roomId });
        if (error) { throwError(StatusCodes.BAD_REQUEST, error.details[0].message); }
        const { userCode, roomId } = value;
        await removeRoom(userCode, roomId);
        return sendResponse(res, ConstantResponseStatus.SUCCESS);
    })
};