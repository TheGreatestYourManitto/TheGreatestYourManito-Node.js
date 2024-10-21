import express from 'express';
import { tempRouter } from './src/router/temp-route';

const app = express();
const port = 3000;

app.use('/temp', tempRouter);

app.listen(port, () => {
    console.log(`example app listening on port ${port}`);
});