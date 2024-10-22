import { StatusCodes } from "http-status-codes";
import { throwError } from "./response-helper";

/**
 * 7자리 랜덤 코드를 생성하는 함수
 * 
 * @returns {string} - 생성된 7자리 랜덤 코드 (대소문자+숫자)
 */
const generateRandomCode = () => {
    return Math.random().toString(36).substring(2, 9);
};

/**
 * 랜덤 코드를 생성하고, 중복되지 않는 코드를 반환하는 함수.
 * 
 * @param {string} mark - 코드 접두 마크 ("U" 또는 "R")
 * @param {Function} checkExistsFn - 중복 체크 함수 (예: isUserCodeExists 또는 isRoomCodeExists)
 * @returns {Promise<string>} - 생성된 유일한 코드
 * @throws {Error} - 중복 코드 생성 시도 횟수가 초과될 경우 에러 발생
 */
export const generateUniqueRandomCode = async (mark, checkExistsFn) => {
    let randomCode;
    const maxAttempts = 10;  // 중복 검사 시 최대 시도 횟수
    let attempt = 0;

    // 중복되지 않는 코드 생성 및 검증
    while (attempt < maxAttempts) {
        randomCode = mark + generateRandomCode();
        const isExists = await checkExistsFn(randomCode); // 중복 체크 함수 호출
        if (!isExists) { break; }
        attempt++;
    }

    if (attempt === maxAttempts) {
        throwError(StatusCodes.INTERNAL_SERVER_ERROR, `${mark} 코드를 생성할 수 없습니다.`);
    }

    return randomCode;
}


