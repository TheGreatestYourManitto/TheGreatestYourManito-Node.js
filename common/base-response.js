/**
 * 표준화된 응답 객체를 생성합니다.
 * 
 * @param {Object} response - 응답 객체로, 성공 여부, 코드, 메시지를 포함합니다.
 * @param {boolean} response.isSuccess - 응답이 성공했는지 여부를 나타냅니다.
 * @param {number} response.code - 응답 코드.
 * @param {string} response.message - 응답 메시지.
 * @param {*} result - 응답 결과 데이터.
 * 
 * @returns {Object} - 표준화된 응답 객체.
 */
export const baseResponse = ({ isSuccess, code, message }, result) => {
    return {
        isSuccess: isSuccess,
        code: code,
        message: message,
        result: result
    }
};