import { BaseError } from './base-error.js';
import { responseStatus } from './response-status.js';

/**
 * 에러를 생성하고 던지는 헬퍼 함수
 * 
 * @param {number} statusCode - HTTP 상태 코드
 * @param {string} message - 에러 메시지
 */
export const throwError = (statusCode, message) => {
    throw new BaseError(responseStatus(statusCode, message));
};

/**
 * 서버 응답을 처리하는 헬퍼 함수.
 * 
 * 이 함수는 상태 코드, 메시지, 결과 데이터를 포함한 표준화된 응답을 생성하여 클라이언트에게 전송합니다.
 * 
 * @param {Object} res - Express 응답 객체.
 * @param {Object} responseStatus - 응답 상태 객체, `ConstantResponseStatus` 중 하나. 성공 여부, 코드, 메시지를 포함.
 * @param {*} [result=null] - 응답 데이터로, 결과 객체를 전달. 기본값은 null이며, 추가 데이터가 없을 경우 생략 가능.
 * 
 * @returns {Object} - 표준화된 응답을 클라이언트에게 전송합니다.
 */
export const sendResponse = (res, responseStatus, result = null) => {
    const response = {
        isSuccess: responseStatus.isSuccess,
        code: responseStatus.code,
        message: responseStatus.message,
    };

    if (result !== null) { response.result = result; } // result가 null이 아닌 경우에만 응답 객체에 추가

    return res.status(responseStatus.code).json(response);
};