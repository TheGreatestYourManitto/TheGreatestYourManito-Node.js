import { StatusCodes } from 'http-status-codes';
import { executeQuery } from '../../common/db-helper.js';
import { throwError } from '../../common/response-helper.js';


/**
 * 유저 코드를 통해 유저 ID를 조회하는 함수
 * @param {string} userCode - 유저의 랜덤 배정 코드 (user.code)
 * @returns {Promise<number>} - 유저 ID
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
 * 특정 유저가 관리자이거나 참여한 방을 조회하는 함수
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
    return result;
};

export const insertRoom = async (roomData) => {
    const query = 'INSERT INTO room (admin_user_id, invitation_code, room_name, end_date) VALUES (?, ?, ?)'
    const result = await executeQuery(query, [roomData.userId, roomData.roomCode, roomData.roomName, roomData.endDate]);
    return result.insertId;
}