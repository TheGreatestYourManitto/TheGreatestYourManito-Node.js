import { responseStatus } from '../../common/response-status.js';
import { getTempData } from '../service/user-service.js';
import { baseResponse } from '../../common/base-response.js';
import { checkFlag } from '../service/user-service.js';

export const tempTest = (req, res, next) => {
    res.send(response(responseStatus.SUCCESS, getTempData()));
};

export const tempException = (req, res, next) => {
    console.log(`/temp/exception/${req.params.flag}`);
    return res.send(baseResponse(responseStatus.SUCCESS, checkFlag(req.params.flag)));
}

import { createUser } from '../service/user-service.js';

export const createUserController = async (req, res, next) => {
    try {
        const { nickname, deviceId } = req.body;
        if (!nickname || !deviceId) {
            return res.status(400).json({ message: 'Nickname and deviceId are required' });
        }

        const userIdentifier = await createUser(nickname, deviceId);
        res.status(201).json({ result: { userIdentifier } });
    } catch (error) {
        next(error);  // Error handling middleware로 넘김
    }
};