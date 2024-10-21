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