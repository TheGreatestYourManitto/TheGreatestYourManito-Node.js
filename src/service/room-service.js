import { selectRoom, selectUserIdByCode } from '../dao/room-dao.js';

/**
 * 유저 코드로 방 정보를 검색하는 함수
 * @param {string} userCode - 유저의 랜덤 배정 코드 (user.code)
 * @returns {Promise<Array>} - 방 리스트
 */
export const searchRoom = async (userCode) => {
    const userId = await selectUserIdByCode(userCode); // 유저 코드로 유저 ID 가져오기
    return await selectRoom(userId); // 유저 ID를 사용하여 방 정보 가져오기
};