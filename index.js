import express from 'express';
import { BaseError } from './common/base-error.js';
import { responseStatus } from './common/response-status.js';
import dotenv from 'dotenv';
import { specs } from './common/config/swagger-config.js';
import SwaggerUi from 'swagger-ui-express';

dotenv.config();

const app = express();

app.set('port', process.env.PORT || 3000)

app.use(express.urlencoded({ extended: false })); // 단순 객체 문자열 형태로 본문 데이터 해석

// swagger
app.use('/api-docs', SwaggerUi.serve, SwaggerUi.setup(specs));

// error handling
app.use((req, res, next) => {
    const err = new BaseError(responseStatus.NOT_SUPPORTED_URI_ERROR);
    next(err);
});

// error handling
app.use((err, req, res, next) => {
    // 템플릿 엔진 변수 설정
    res.locals.message = err.message;
    // 개발환경이면 에러를 출력하고 아니면 출력하지 않기
    res.locals.error = process.env.NODE_ENV == 'DEV' ? err : {};
    res.status(err.data.status).send(response(err.data));
});


app.listen(app.get('port'), () => {
    console.log(`example app listening on port ${app.get('port')}`);
});