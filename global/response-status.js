import { StatusCodes } from "http-status-codes";

/**
 * 서버의 응답 상태를 표준화한 상수 객체.
 * 각 상태에 대해 성공 여부, 상태 코드, 응답 메시지를 정의합니다.
 */
export const responseStatus = {
    // 200: 성공 응답
    SUCCESS: { "isSuccess": true, "code": StatusCodes.OK, "message": "요청 성공" },
    CREATED: { "isSuccess": true, "code": StatusCodes.CREATED, "message": "요청 성공, 리소스 생성" },

    // 400: 클라이언트 오류 응답
    NOT_AUTHORIZED: { "isSuccess": false, "code": StatusCodes.UNAUTHORIZED, "message": "인증되지 않은 요청" },
    NOT_SUPPORTED_URI_ERROR: { "isSuccess": false, "code": StatusCodes.BAD_REQUEST, "message": "지원하지 않는 URI" },

    // 500: 서버 오류 응답
    INTERNAL_SERVER_ERROR: { "isSuccess": false, "code": StatusCodes.INTERNAL_SERVER_ERROR, "message": "서버 내부 오류" },
    NOT_IMPLEMENTED: { "isSuccess": false, "code": StatusCodes.NOT_IMPLEMENTED, "message": "구현되지 않은 기능" },
};