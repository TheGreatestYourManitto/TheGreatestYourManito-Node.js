import { ConstantResponseStatus, StatusCodes } from "../../common/index.js";
import { sendResponse, throwError } from "../../common/response-helper.js";
import asyncHandler from "express-async-handler";
import { CheerSchema } from "../dto/cheer-dto.js";
import { searchCheerMessage, sendCheer } from "../service/cheer-service.js";

export const CheerController = {
    getCheerMessage: asyncHandler(async (req, res) => {
        const { error, value } = CheerSchema.getCheerMessageDto.validate({ cheerType: req.params.type });
        if (error) { throwError(StatusCodes.BAD_REQUEST, error.details[0].message); }
        const { cheerType } = value;
        const result = await searchCheerMessage(cheerType);
        return sendResponse(res, ConstantResponseStatus.SUCCESS, { "message": result });
    }),
    postCheer: asyncHandler(async (req, res) => {
        const data = { userCode: req.get('userCode'), roomId: req.body.roomId, cheerType: req.body.cheerType, message: req.body.message };
        const { error, value } = CheerSchema.postCheerDto.validate(data);
        if (error) { throwError(StatusCodes.BAD_REQUEST, error.details[0].message); }
        const { userCode, roomId, cheerType, message } = value;
        const result = await sendCheer({ userCode, roomId, cheerType, message });
        return sendResponse(res, ConstantResponseStatus.SUCCESS, { "todaysCheeringCount": result });
    })
}