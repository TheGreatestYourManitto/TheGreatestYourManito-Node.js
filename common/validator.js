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

/**
 * 한글 또는 영문, maxLength 이하인지 확인하는 유효성 검사 함수
 * 
 * @param {string} field - 검사할 필드 이름
 * @param {string} value - 검사할 필드 값
 * @param {number} maxLength - 허용되는 최대 길이
 */
export const validateString = (field, value, maxLength) => {

    // 한글 또는 영문만 허용하는 정규 표현식
    const regex = /^[a-zA-Z가-힣]+$/;

    // 값이 문자열이 아닐 때
    if (typeof value !== 'string') {
        throw new BaseError(responseStatus(StatusCodes.BAD_REQUEST, `${field}은(는) 문자열이어야 합니다.`));
    }

    // 한글 또는 영문이 아닌 경우
    if (!regex.test(value)) {
        throw new BaseError(responseStatus(StatusCodes.BAD_REQUEST, `${field}은(는) 한글 또는 영문만 가능합니다.`));
    }

    // 최대 길이 초과 시
    if (value.length > maxLength) {
        throw new BaseError(responseStatus(StatusCodes.BAD_REQUEST, `${field}은(는) 한글 또는 영문 ${maxLength}자 이하만 가능합니다.`));
    }
};