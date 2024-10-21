import { responseStatus } from '../../common/response-status.js';
import { getTempData } from '../service/temp-service.js';
import { baseResponse } from '../../common/base-response.js';
import { checkFlag } from '../service/temp-service.js';

export const tempTest = (req, res, next) => {
    res.send(response(responseStatus.SUCCESS, getTempData()));
};

export const tempException = (req, res, next) => {
    console.log(`/temp/exception/${req.params.flag}`);
    return res.send(baseResponse(responseStatus.SUCCESS, checkFlag(req.params.flag)));
}