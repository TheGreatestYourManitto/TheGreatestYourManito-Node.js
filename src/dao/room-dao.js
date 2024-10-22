import { StatusCodes } from 'http-status-codes';
import { executeQuery } from '../../common/db-helper.js';
import { throwError } from '../../common/response-helper.js';


/**
 * 유저 코드를 통해 유저 ID를 조회하는 함수
 * 
 * 주어진 유저의 랜덤 배정 코드(user.code)를 사용하여 해당 유저의 ID를 조회합니다.
 * 유저가 존재하지 않을 경우, 404 상태 코드를 포함한 에러를 던집니다.
 * 
 * @param {string} userCode - 유저의 랜덤 배정 코드 (user.code)
 * @returns {Promise<number>} - 조회된 유저의 ID
 * @throws {BaseError} - 유저가 존재하지 않을 경우 에러를 던집니다.
 */
export const selectUserIdByCode = async (userCode) => {
    const query = 'SELECT id FROM user WHERE code = ?';
    const result = await executeQuery(query, [userCode]);

    // 유저가 없을 경우 에러 처리
    if (result.length === 0) {
        throwError(StatusCodes.NOT_FOUND, '해당 유저를 찾을 수 없습니다.');
    }

    return result[0].id;  // 유저 ID 반환
};

/**
 * 방 초대 코드가 이미 존재하는지 확인하는 함수
 * 
 * 주어진 방 초대 코드가 DB에 존재하는지 확인합니다.
 * 
 * @param {string} roomCode - 방 초대 코드 (invitation_code)
 * @returns {Promise<boolean>} - 해당 초대 코드가 존재하면 true, 그렇지 않으면 false
 */
export const isRoomCodeExists = async (roomCode) => {
    const query = 'SELECT COUNT(*) as count FROM room WHERE invitation_code = ?';
    const result = await executeQuery(query, [roomCode]);
    return result[0].count > 0; // 초대 코드 존재 여부 반환
}


/**
 * 특정 유저가 관리자이거나 참여한 방을 조회하는 함수
 * 
 * 주어진 유저 ID를 기반으로 해당 유저가 관리자이거나 참여한 방 정보를 조회합니다.
 * 
 * @param {number} userId - 유저 ID
 * @returns {Promise<Array>} - 조회된 방 리스트
 */
export const selectRoom = async (userId) => {
    const query = `
        SELECT room.*
        FROM room
        LEFT JOIN manitto ON room.id = manitto.room_id
        WHERE room.admin_user_id = ? OR manitto.user_id = ?;
    `;
    const result = await executeQuery(query, [userId, userId]);
    return result;   // 조회된 방 리스트 반환
};

/**
 * 새로운 방을 생성하는 함수
 * 
 * 주어진 방 데이터를 기반으로 방을 DB에 저장합니다.
 * 
 * @param {Object} roomData - 방 생성에 필요한 데이터
 * @param {number} roomData.userId - 방 관리자 ID
 * @param {string} roomData.roomCode - 방 초대 코드
 * @param {string} roomData.roomName - 방 이름
 * @param {string} roomData.endDate - 방 종료일 (ISO 8601 형식)
 * @returns {Promise<number>} - 생성된 방의 ID
 */
export const insertRoom = async (roomData) => {
    const query = 'INSERT INTO room (admin_user_id, invitation_code, room_name, end_date) VALUES (?, ?, ?, ?)'
    const result = await executeQuery(query, [roomData.userId, roomData.roomCode, roomData.roomName, roomData.endDate]);
    return result.insertId; // 생성된 방 ID 반환
}