import express from 'express';
import { tempRouter } from './src/router/temp-route';
import { BaseError } from './global/base-error';
import { responseStatus } from './global/response-status';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.set('port', process.env.PORT || 3000)

app.use('/temp', tempRouter);

app.use((req, res, next) => {
    const err = new BaseError(responseStatus.NOT_SUPPORTED_URI_ERROR);
    next(err);
});

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