import express from 'express';
import { BaseError, responseStatus, StatusCodes, ConstantResponseStatus } from './common/index.js';
import { sendResponse } from './common/response-helper.js';
import dotenv from 'dotenv';
import { specs } from './common/config/swagger-config.js';
import SwaggerUi from 'swagger-ui-express';

import userRouter from './src/router/user-router.js';
import roomRouter from './src/router/room-router.js';

dotenv.config();

const app = express();

// 포트 설정
app.set('port', process.env.PORT || 3000);

// 미들웨어 설정
app.use(express.json());  // JSON 파싱 미들웨어
app.use(express.urlencoded({ extended: false })); // URL 인코딩된 데이터를 파싱

// Swagger UI 설정
app.use('/api-docs', SwaggerUi.serve, SwaggerUi.setup(specs));

// 유저 라우터 설정
app.use('/user', userRouter);
// 방 라우터 설정
app.use('/room', roomRouter);

// 지원하지 않는 요청 처리 미들웨어
app.use((req, res, next) => {
    const err = new BaseError(responseStatus(StatusCodes.NOT_FOUND, '지원되지 않는 HTTP method 혹은 URI입니다.'));
    next(err);
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err);

    // 에러 객체가 BaseError인지 확인하여 적절한 응답 반환
    if (err instanceof BaseError) {
        sendResponse(res, err.data);
    } else { // 예상치 못한 에러 처리
        sendResponse(res, ConstantResponseStatus.INTERNAL_SERVER_ERROR);
    }
});

// 서버 시작
app.listen(app.get('port'), () => {
    console.log(`example app listening on port ${app.get('port')}`);
});