import { StatusCodes } from 'http-status-codes';
import { responseStatus } from '../../common/response-status.js';
import { baseResponse } from '../../common/base-response.js';
import { BaseError } from '../../common/base-error.js';
import { createUser } from '../service/user-service.js';
import { postUserDto } from '../dto/user-dto.js';
import asyncHandler from 'express-async-handler';

export const UserController = {
    postUser: asyncHandler(async (req, res) => {
        const { error, value } = postUserDto.validate(req.body);  // Joi 스키마를 사용한 유효성 검사

        if (error) { // 유효성 검사 에러 발생 시
            throw new BaseError(responseStatus(StatusCodes.BAD_REQUEST, error.details[0].message));
        }

        // Joi 검증을 통과한 유효한 데이터 추출
        const { nickname, deviceId } = value;

        // 서비스에서 유저 생성 로직 처리
        const userIdentifier = await createUser(nickname, deviceId);

        return res.status(201).json(baseResponse(responseStatus.CREATED, { userIdentifier }));
    })
};