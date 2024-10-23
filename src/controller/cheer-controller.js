import { ConstantResponseStatus, StatusCodes } from "../../common/index.js";
import { sendResponse, throwError } from "../../common/response-helper.js";
import asyncHandler from "express-async-handler";
import { CheerSchema } from "../dto/cheer-dto.js";
import { searchCheerMessage } from "../service/cheer-service.js";

export const CheerController = {
    getCheerMessage: asyncHandler(async (req, res) => {
        const { error, value } = CheerSchema.getCheerMessageDto.validate({ cheerType: req.params.type });
        if (error) { throwError(StatusCodes.BAD_REQUEST, error.details[0].message); }
        const { cheerType } = value;
        const result = await searchCheerMessage(cheerType);
        return sendResponse(res, ConstantResponseStatus.SUCCESS, { "message": result });
    })
}