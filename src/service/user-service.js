import { generateUniqueRandomCode } from '../../common/code-generator.js';
import { isUserCodeExists, insertUser, selectUser } from '../dao/user-dao.js';

/**
 * 유저를 생성하는 함수
 * 
 * 1. 7자리 랜덤 코드를 생성하고 유저코드와 합칩니다.
 * 2. 생성된 코드가 DB에 이미 존재하는지 확인합니다.
 * 3. 중복되지 않는 코드를 생성하여 유저를 DB에 저장합니다.
 * 
 * @param {string} nickname - 유저의 닉네임
 * @param {string} deviceId - 유저의 디바이스 ID
 * @returns {string} - 생성된 유저 코드
 * @throws {BaseError} - 일정 횟수 이후에도 유저 코드를 생성하지 못할 경우 에러 발생
 */
export const createUser = async (nickname, deviceId) => {
    const randomCode = await generateUniqueRandomCode("U", isUserCodeExists);
    await insertUser({ nickname, deviceId, userCode: randomCode });
    return randomCode;  // 생성된 유저 코드 반환
};

/**
 * 유저 정보를 조회하는 함수
 * 
 * 주어진 deviceId를 사용하여 유저 정보를 DB에서 조회합니다.
 * 
 * @param {string} deviceId - 조회할 유저의 기기 ID
 * @returns {Promise<Object>} - 조회된 유저 정보 객체
 * @throws {BaseError} - 유저 정보 조회 중 에러가 발생하면 에러를 던집니다.
 */
export const searchUser = async (deviceId) => {
    return await selectUser(deviceId);
}