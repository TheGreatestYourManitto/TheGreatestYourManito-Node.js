import { StatusCodes } from 'http-status-codes';
import { generateUniqueRandomCode } from '../../common/code-generator.js';
import { throwError } from '../../common/response-helper.js';
import { checkRoomAdmin, deletePatchRoomMember, insertManitto, insertRoom, isRoomCodeExists, selectRoom, selectRoomIdByCode, selectRoomInfo, selectUserIdByCode, updateRoomStatus } from '../dao/room-dao.js';

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

/**
 * 방 정보를 조회하는 서비스 함수
 * 
 * 주어진 유저 코드(userCode)와 방 ID(roomId)를 사용하여,
 * 유저 ID를 조회한 뒤, 해당 유저가 방에 속해 있는지 확인하고,
 * 방 정보와 방에 속한 유저 목록, 관리자 여부를 조회하여 반환합니다.
 * 
 * @param {string} userCode - 유저의 랜덤 배정 코드 (user.code)
 * @param {number} roomId - 방 ID
 * @returns {Promise<Object>} - 방 정보, 관리자 여부, 유저 목록을 포함한 객체
 * @throws {BaseError} - 유저를 찾지 못했거나 방 정보를 조회하는 과정에서 문제가 발생할 경우 에러를 던집니다.
 * 
 * 반환 객체 예시:
 * {
 *   id: number,  // 방 ID
 *   roomName: string,  // 방 이름
 *   endDate: string,  // 방 종료일 (ISO 8601 형식)
 *   invitationCode: string,  // 방 초대 코드
 *   isAdmin: boolean,  // 요청한 유저가 방의 관리자인지 여부
 *   members: [  // 방에 속한 멤버 목록
 *     {
 *       userId: number,  // 멤버의 유저 ID
 *       nickname: string  // 멤버의 닉네임
 *     }
 *   ]
 * }
 */
export const searchRoomInfo = async (userCode, roomId) => {
    const userId = await selectUserIdByCode(userCode);
    const roomInfo = await selectRoomInfo({ userId, roomId });
    return roomInfo;
}

/**
 * 유저가 방에 참여하는 함수
 * 
 * 주어진 유저 코드(userCode)와 초대 코드(invitationCode)를 사용하여,
 * 유저 ID와 방 ID를 조회한 후, 해당 유저를 방에 참여시킵니다.
 * 
 * @param {string} userCode - 유저의 랜덤 배정 코드 (user.code)
 * @param {string} invitationCode - 방의 초대 코드 (invitation_code)
 * @returns {Promise<number>} - 생성된 마니또 관계 (방-유저)의 ID
 * @throws {BaseError} - 방 초대 코드를 찾지 못했거나 유저를 찾지 못한 경우 에러를 던집니다.
 */
export const participateRoom = async (userCode, invitationCode) => {
    const userId = await selectUserIdByCode(userCode);
    const roomId = await selectRoomIdByCode(invitationCode);
    const manittoId = await insertManitto({ userId, roomId });
    return manittoId; // 생성된 마니또 관계 (방-유저) 반환
}

/**
 * 방 멤버를 삭제하는 함수 (관리자만 가능)
 * 
 * 주어진 유저 코드(userCode)를 통해 방의 관리자 여부를 확인한 후,
 * 삭제할 유저 ID가 방장 자신인 경우 삭제가 불가능하도록 에러를 발생시킵니다.
 * 방장 확인 후, 멤버를 비활성화(삭제) 처리합니다.
 * 
 * @param {string} userCode - 방 관리자의 유저 코드 (user.code)
 * @param {number} roomId - 방 ID
 * @param {number} userId - 삭제할 유저의 ID
 * @returns {Promise<Object>} - 삭제 결과
 * @throws {BaseError} - 방장이 자기 자신을 삭제하려고 하거나, 방장이 아닌 경우, 또는 삭제할 유저가 없을 경우 에러 발생
 */
export const removeRoomMember = async (userCode, roomId, userId) => {
    const adminUserId = await selectUserIdByCode(userCode);
    if (adminUserId == userId) { throwError(StatusCodes.BAD_REQUEST, '방장은 자기 자신을 삭제할 수 없습니다.'); }
    await checkRoomAdmin({ adminUserId, roomId });
    const result = await deletePatchRoomMember({ roomId, userId });
    return result;
}

export const confirmRoomStatus = async (userCode, roomId) => {
    const userId = await selectUserIdByCode(userCode);
    await checkRoomAdmin({ adminUserId: userId, roomId });
    const result = await updateRoomStatus({ userId, roomId })
    return result;
}