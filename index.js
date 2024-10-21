import express from 'express';
import { BaseError } from './common/base-error.js';
import { responseStatus } from './common/response-status.js';
import { baseResponse } from './common/base-response.js';
import { StatusCodes } from 'http-status-codes';
import dotenv from 'dotenv';
import { specs } from './common/config/swagger-config.js';
import SwaggerUi from 'swagger-ui-express';

import userRouter from './src/router/user-router.js';

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

// 지원되지 않는 URI 처리 미들웨어
app.use((req, res, next) => {
    const err = new BaseError(responseStatus(StatusCodes.NOT_FOUND, '지원되지 않는 URI입니다.'));
    next(err);
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err);

    // 에러 객체가 BaseError인지 확인하여 적절한 응답 반환
    if (err instanceof BaseError) {
        res.status(err.data.code).json(baseResponse(err.data));  // baseResponse 사용
    } else {
        // 예상치 못한 에러 처리
        res.status(500).json(baseResponse(responseStatus(StatusCodes.INTERNAL_SERVER_ERROR, '서버 내부 오류가 발생했습니다.')));
    }
});

// 서버 시작
app.listen(app.get('port'), () => {
    console.log(`example app listening on port ${app.get('port')}`);
});