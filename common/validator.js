import { BaseError } from './base-error.js';
import { responseStatus } from './response-status.js';
import { StatusCodes } from 'http-status-codes';

/**
 * 필수 필드를 검사하는 유효성 검사 함수
 * 
 * @param {Object} data - 검사할 데이터 객체
 * @param {Array} requiredFields - 필수 필드 목록
 */
export const validateRequiredFields = (data, requiredFields) => {
    requiredFields.forEach((field) => {
        if (!data[field]) {
            throw new BaseError(responseStatus(StatusCodes.BAD_REQUEST, `${field}이(가) 비어있습니다.`));
        }
    });
};