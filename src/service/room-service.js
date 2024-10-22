import { generateUniqueRandomCode } from '../../common/code-generator.js';
import { insertRoom, isRoomCodeExists, selectRoom, selectUserIdByCode } from '../dao/room-dao.js';

/**
 * 유저 코드로 방 정보를 검색하는 함수
 * 
 * 주어진 유저의 랜덤 배정 코드(user.code)를 기반으로 유저의 ID를 조회한 후, 
 * 유저가 관리자이거나 참여한 방 목록을 반환합니다.
 * 
 * @param {string} userCode - 유저의 랜덤 배정 코드 (user.code)
 * @returns {Promise<Array>} - 유저가 관리자이거나 참여한 방 리스트
 * @throws {BaseError} - 유저를 찾지 못했을 경우 에러를 던집니다.
 */
export const searchRoom = async (userCode) => {
    const userId = await selectUserIdByCode(userCode); // 유저 코드로 유저 ID 가져오기
    return await selectRoom(userId); // 유저 ID를 사용하여 방 정보 가져오기
};

/**
 * 새로운 방을 생성하는 함수
 * 
 * 유저 코드로 유저 ID를 조회한 후, 새로운 방 코드를 생성하고,
 * 해당 유저가 관리자인 방을 DB에 추가합니다.
 * 
 * @param {string} userCode - 방을 생성하는 관리자의 유저 코드
 * @param {string} roomName - 생성할 방의 이름
 * @param {string} endDate - 방의 종료일 (ISO 8601 형식)
 * @returns {Promise<string>} - 생성된 방의 초대 코드 (invitation_code)
 * @throws {BaseError} - 방 초대 코드를 생성하지 못했거나 유저를 찾지 못한 경우 에러를 던집니다.
 */
export const createRoom = async (userCode, roomName, endDate) => {
    const randomCode = await generateUniqueRandomCode("R", isRoomCodeExists);
    const userId = await selectUserIdByCode(userCode);
    await insertRoom({ userId, roomCode: randomCode, roomName, endDate });
    return randomCode; // 생성된 방 코드 반환
}