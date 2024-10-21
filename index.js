import express from 'express';
import { BaseError } from './common/base-error.js';
import { responseStatus } from './common/response-status.js';
import dotenv from 'dotenv';
import { specs } from './common/config/swagger-config.js';
import SwaggerUi from 'swagger-ui-express';

import userRouter from './src/router/user-router.js';

dotenv.config();

const app = express();

app.set('port', process.env.PORT || 3000)

app.use(express.json());  // JSON 파싱 미들웨어
app.use(express.urlencoded({ extended: false })); // 단순 객체 문자열 형태로 본문 데이터 해석

// swagger
app.use('/api-docs', SwaggerUi.serve, SwaggerUi.setup(specs));

// 유저 라우터 설정
app.use('/user', userRouter);

// error handling
app.use((req, res, next) => {
    const err = new BaseError(responseStatus.NOT_SUPPORTED_URI_ERROR);
    next(err);
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    if (process.env.NODE_ENV == 'DEV') { console.log(err); };
    res.status(err.data.status).send(response(err.data));
});


app.listen(app.get('port'), () => {
    console.log(`example app listening on port ${app.get('port')}`);
});