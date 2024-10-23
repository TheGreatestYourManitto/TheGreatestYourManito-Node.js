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
    // 방 생성 쿼리
    const query = 'INSERT INTO room (admin_user_id, invitation_code, room_name, end_date) VALUES (?, ?, ?, ?)';
    const result = await executeQuery(query, [roomData.userId, roomData.roomCode, roomData.roomName, roomData.endDate]);

    // 생성된 방의 room_id와 user_id로 마니또 테이블에 추가
    const insertQuery = 'INSERT INTO manitto (room_id, user_id) VALUES (?, ?)';
    await executeQuery(insertQuery, [result.insertId, roomData.userId]);

    return result.insertId; // 생성된 방 ID 반환
}

/**
 * 방 정보를 조회하는 함수
 * 
 * 주어진 roomId와 userId를 기반으로 해당 유저가 방에 속해 있는지 확인하고, 
 * 방 정보를 조회한 후, 해당 유저가 방의 관리자인지 여부를 포함하여 반환합니다.
 * 
 * @param {Object} roomData - 방 정보 조회에 필요한 데이터
 * @param {number} roomData.roomId - 조회할 방의 ID
 * @param {number} roomData.userId - 요청하는 유저의 ID
 * @returns {Promise<Object>} - 방 정보와 함께 해당 방의 멤버 목록 및 관리자 여부
 * @throws {BaseError} - 유저가 방에 속하지 않거나, 방 정보를 찾을 수 없을 경우 에러를 던집니다.
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
export const selectRoomInfo = async (roomData) => {
    // 유저가 방에 속해 있는지 확인
    const checkQuery = `
        SELECT COUNT(*) as count
        FROM manitto
        WHERE room_id = ? AND user_id = ?;
    `;
    const checkResult = await executeQuery(checkQuery, [roomData.roomId, roomData.userId]);
    if (checkResult[0].count === 0) { throwError(StatusCodes.FORBIDDEN, '해당 유저는 이 방에 속해 있지 않습니다.'); }

    // 방 정보 조회
    const roomQuery = 'SELECT * FROM room WHERE id = ?';
    const roomResult = await executeQuery(roomQuery, [roomData.roomId]);
    if (roomResult.length === 0) { throwError(StatusCodes.NOT_FOUND, '해당 방을 찾을 수 없습니다.'); }

    // 해당 roomId에 속한 manitto.userId와 user.nickname을 조회
    const userQuery = `
        SELECT manitto.user_id, user.nickname
        FROM manitto
        JOIN user ON manitto.user_id = user.id
        WHERE manitto.room_id = ?;
    `;
    const userResult = await executeQuery(userQuery, [roomData.roomId]);
    if (userResult.length === 0) { throwError(StatusCodes.NOT_FOUND, '해당 방의 멤버 목록을 찾을 수 없습니다.'); }

    // admin_user_id와 현재 요청된 userId 비교하여 isAdmin 값 설정
    const isAdmin = roomResult[0].admin_user_id === roomData.userId;

    // 방 정보와 함께 유저 목록 및 isAdmin 플래그 포함한 결과 반환
    return {
        ...roomResult[0],  // 방 정보
        isAdmin: isAdmin,   // 관리자 여부
        members: userResult.map(user => ({
            userId: user.user_id,
            nickname: user.nickname
        }))  // 유저 목록
    };
}

export const selectRoomIdByCode = async (invitationCode) => {
    const query = 'SELECT id FROM room WHERE invitation_code = ?';
    const result = await executeQuery(query, [invitationCode]);

    // 방이 없을 경우 에러 처리
    if (result.length === 0) {
        throwError(StatusCodes.NOT_FOUND, '해당 방을 찾을 수 없습니다.');
    }

    return result[0].id;  // 방 ID 반환
}

export const insertManitto = async (manittoData) => {
    const query = 'INSERT INTO manitto (room_id, user_id) VALUES (?, ?)';
    const result = await executeQuery(query, [manittoData.roomId, manittoData.userId]);
    return result.insertId;
}