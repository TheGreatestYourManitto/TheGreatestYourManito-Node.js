import { StatusCodes } from 'http-status-codes';
import { executeQuery } from '../../common/db-helper.js';
import { throwError } from '../../common/response-helper.js';
import { exceptions } from 'winston';


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
        SELECT DISTINCT room.*
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

/**
 * 방 초대 코드로 방 ID를 조회하는 함수
 * 
 * 주어진 방 초대 코드(invitation_code)를 사용하여, 방 ID를 조회합니다.
 * 방이 존재하지 않을 경우, 404 상태 코드를 포함한 에러를 던집니다.
 * 
 * @param {string} invitationCode - 방의 초대 코드 (invitation_code)
 * @returns {Promise<number>} - 조회된 방의 ID
 * @throws {BaseError} - 방이 존재하지 않을 경우 에러를 던집니다.
 */
export const selectRoomIdByCode = async (invitationCode) => {
    const query = 'SELECT id FROM room WHERE invitation_code = ?';
    const result = await executeQuery(query, [invitationCode]);

    // 방이 없을 경우 에러 처리
    if (result.length === 0) { throwError(StatusCodes.NOT_FOUND, '해당 방을 찾을 수 없습니다.'); }

    return result[0].id;  // 방 ID 반환
}

/**
 * 방과 유저를 마니또 관계로 추가하는 함수
 * 
 * 주어진 방 ID와 유저 ID를 사용하여, 해당 유저를 방에 마니또로 추가합니다.
 * 
 * @param {Object} manittoData - 마니또 관계를 생성하는 데 필요한 데이터
 * @param {number} manittoData.roomId - 방 ID
 * @param {number} manittoData.userId - 유저 ID
 * @returns {Promise<number>} - 생성된 마니또 관계의 ID
 */
export const insertManitto = async (manittoData) => {
    const query = 'INSERT INTO manitto (room_id, user_id) VALUES (?, ?)';
    const result = await executeQuery(query, [manittoData.roomId, manittoData.userId]);
    return result.insertId;
}

/**
 * 방장이 맞는지 확인하는 함수
 * 
 * 주어진 방 ID(roomId)와 유저 ID(userId)를 통해,
 * 해당 유저가 해당 방의 관리자(방장)인지 확인합니다.
 * 방장이 아닌 경우 403 에러를 발생시킵니다.
 * 
 * @param {Object} adminData - 관리자 확인에 필요한 데이터
 * @param {number} adminData.roomId - 방 ID
 * @param {number} adminData.userId - 유저 ID
 * @returns {Promise<void>} - 방장이 아닌 경우 에러 발생
 * @throws {BaseError} - 방장이 아닌 경우 에러 발생
 */
export const checkRoomAdmin = async (adminData) => {
    const query = `
        SELECT COUNT(*) as count
        FROM room
        WHERE id = ? AND admin_user_id = ?;
    `;
    const checkResult = await executeQuery(query, [adminData.roomId, adminData.adminUserId]);
    if (checkResult[0].count === 0) { throwError(StatusCodes.FORBIDDEN, '해당 유저는 이 방의 방장이 아닙니다.'); }
}

/**
 * 방 멤버를 삭제하는 함수
 * 
 * 주어진 방 ID(roomId)와 유저 ID(userId)를 사용하여,
 * 해당 유저를 방에서 삭제합니다.
 * 멤버가 존재하지 않을 경우, 404 에러를 발생시킵니다.
 * 
 * @param {Object} memberData - 멤버 삭제에 필요한 데이터
 * @param {number} memberData.roomId - 방 ID
 * @param {number} memberData.userId - 삭제할 유저의 ID
 * @returns {Promise<Object>} - 삭제 결과
 * @throws {BaseError} - 멤버가 존재하지 않을 경우 에러 발생
 */
export const deleteRoomMember = async (memberData) => {
    const query = `
        DELETE FROM manitto
        WHERE room_id = ? AND user_id = ?;
    `;
    const result = await executeQuery(query, [memberData.roomId, memberData.userId]);
    if (result.affectedRows === 0) { throwError(StatusCodes.NOT_FOUND, '해당 방의 멤버를 찾을 수 없습니다.'); }
    return result;
}

/**
 * 방의 상태를 업데이트하는 함수
 * 
 * 주어진 방 ID(roomId)와 관리자 ID(userId)를 기반으로 방의 상태를 '확정됨'으로 업데이트합니다.
 * 방이 존재하지 않거나 업데이트에 실패할 경우, 404 에러를 발생시킵니다.
 * 
 * @param {Object} adminData - 방 상태 업데이트에 필요한 데이터
 * @param {number} adminData.userId - 방 관리자의 유저 ID
 * @param {number} adminData.roomId - 업데이트할 방의 ID
 * @returns {Promise<Object>} - 방 상태 업데이트 결과
 * @throws {BaseError} - 방이 존재하지 않거나 업데이트에 실패할 경우 에러 발생
 */
export const updateRoomStatus = async (adminData) => {
    const query = `
        UPDATE room 
        SET is_confirmed = true 
        WHERE admin_user_id = ? AND id = ?; 
    `;
    const result = await executeQuery(query, [adminData.userId, adminData.roomId]);
    if (result.affectedRows === 0) { throwError(StatusCodes.NOT_FOUND, '해당 방을 찾을 수 없습니다.'); }
    return result;
}


/**
 * 특정 방의 모든 유저 ID를 조회하는 함수
 * 
 * 주어진 방 ID(roomId)를 기반으로 해당 방에 속한 유저들의 ID 목록을 반환합니다.
 * 방에 속한 유저가 없을 경우 404 에러를 발생시킵니다.
 * 
 * @param {number} roomId - 조회할 방의 ID
 * @returns {Promise<Array>} - 해당 방에 속한 유저들의 ID 배열
 * @throws {BaseError} - 방에 속한 유저가 없을 경우 에러 발생
 */
export const selectUserIdFromManitto = async (roomId) => {
    const query = `SELECT user_id FROM manitto WHERE room_id = ?`;
    const result = await executeQuery(query, [roomId]);
    if (result.length === 0) { throwError(StatusCodes.NOT_FOUND, '해당 방의 멤버를 찾을 수 없습니다.'); }
    return result;
}

/**
 * 마니또 유저 ID를 업데이트하는 함수
 * 
 * 주어진 방 ID(roomId)와 유저 ID(userId)를 기반으로 마니또로 배정된 유저 ID를 업데이트합니다.
 * 업데이트가 실패하거나 방/유저가 존재하지 않을 경우, 404 에러를 발생시킵니다.
 * 
 * @param {Object} data - 마니또 유저 ID 업데이트에 필요한 데이터
 * @param {number} data.roomId - 업데이트할 방의 ID
 * @param {number} data.userId - 마니또를 배정받는 유저의 ID
 * @param {number} data.manittoUserId - 마니또로 배정할 유저의 ID
 * @returns {Promise<Object>} - 마니또 유저 ID 업데이트 결과
 * @throws {BaseError} - 방이나 유저가 존재하지 않거나 업데이트에 실패할 경우 에러 발생
 */
export const updateManittoUserId = async ({ roomId, userId, manittoUserId }) => {
    const query = `
        UPDATE manitto
        SET manitto_user_id = ?
        WHERE room_id = ? AND user_id = ?;
    `;
    const result = await executeQuery(query, [manittoUserId, roomId, userId]);
    if (result.affectedRows === 0) { throwError(StatusCodes.NOT_FOUND, '매칭된 유저 정보를 업데이트하지 못했습니다.'); }
    return result;
}

/**
 * 특정 유저가 속한 방에서 매칭된 마니또 상대 정보를 조회하는 함수
 * 
 * 주어진 유저 ID(userId)와 방 ID(roomId)를 기반으로, 
 * 해당 유저가 매칭된 마니또 상대의 유저 정보를 조회하여 반환합니다.
 * 
 * @param {Object} param - 유저 ID와 방 ID를 포함한 객체
 * @param {number} param.userId - 유저 ID
 * @param {number} param.roomId - 방 ID
 * @returns {Promise<Object>} - 매칭된 마니또 상대의 유저 ID와 닉네임
 * @throws {BaseError} - 마니또 상대 정보를 찾지 못했을 경우 에러 발생
 */
export const selectManittoInfo = async ({ userId, roomId }) => {
    const query = `        
        SELECT user.id, user.nickname
        FROM manitto
        JOIN user ON manitto.manitto_user_id = user.id
        WHERE manitto.room_id = ? AND manitto.user_id = ?;
    `;
    const result = await executeQuery(query, [roomId, userId]);
    if (result.length === 0) { throwError(StatusCodes.NOT_FOUND, '해당 유저의 마니또 정보를 찾을 수 없습니다.'); }
    return result[0];  // user.id와 user.nickname 반환
}

/**
 * 마니또 관계에서 manitto_user_id로 마니또 관계 ID 조회
 * 
 * 주어진 manitto_user_id와 room_id를 기반으로 마니또 관계 ID를 조회합니다.
 * 
 * @param {Object} data - 마니또 관계 데이터
 * @param {number} data.manittoUserId - 마니또 상대방의 유저 ID
 * @param {number} data.roomId - 방 ID
 * @returns {Promise<number>} - 마니또 관계 ID
 * @throws {BaseError} - 해당 마니또 관계가 없을 경우 에러 발생
 */
export const selectManittoId = async ({ manittoUserId, roomId }) => {
    const query = `SELECT * FROM manitto WHERE room_id = ? AND manitto_user_id = ?`;
    const result = await executeQuery(query, [roomId, manittoUserId]);
    if (result.length === 0) { throwError(StatusCodes.NOT_FOUND, '해당 유저의 마니또 정보를 찾을 수 없습니다.'); }
    return result[0].id;  // manitto 관계의 id 반환
}
