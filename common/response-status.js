import { StatusCodes } from "http-status-codes";

/**
 * 서버의 응답 상태를 표준화하는 함수.
 * 
 * @param {number} statusCode - HTTP 상태 코드 (StatusCodes).
 * @param {string} message - 응답 메시지.
 * 
 * @returns {Object} - 표준화된 응답 객체.
 */
export const responseStatus = (statusCode, message) => {
    const isSuccess = statusCode >= 200 && statusCode < 300;  // 200~299는 성공, 그 외는 실패

    return {
        isSuccess: isSuccess,
        code: statusCode,
        message: message
    };
};

export const ConstantResponseStatus = {
    // 200: 성공 응답
    SUCCESS: { "isSuccess": true, "code": StatusCodes.OK, "message": "요청 성공" },
    CREATED: { "isSuccess": true, "code": StatusCodes.CREATED, "message": "요청 성공, 리소스 생성" },

    // 400: 클라이언트 오류 응답
    NOT_AUTHORIZED: { "isSuccess": false, "code": StatusCodes.UNAUTHORIZED, "message": "인증되지 않은 요청" },
    NOT_FOUND: { "isSuccess": false, "code": StatusCodes.NOT_FOUND, "message": "지원하지 않는 URI" },

    // 500: 서버 오류 응답
    INTERNAL_SERVER_ERROR: { "isSuccess": false, "code": StatusCodes.INTERNAL_SERVER_ERROR, "message": "서버 내부 오류" },
    NOT_IMPLEMENTED: { "isSuccess": false, "code": StatusCodes.NOT_IMPLEMENTED, "message": "구현되지 않은 기능" },
};