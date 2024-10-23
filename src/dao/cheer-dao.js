import { StatusCodes } from 'http-status-codes';
import { executeQuery } from '../../common/db-helper.js';
import { throwError } from '../../common/response-helper.js';

/**
 * 응원 메시지를 DB에서 조회하는 함수
 * 
 * cheer_type 테이블과 cheer 테이블을 LEFT JOIN하여 cheer_type.type_name에 
 * 해당하는 cheer.message를 가져온다.
 * 
 * @param {string} type - 응원 타입 (예: 'luck', 'love', 'fire', 'present')
 * @returns {Promise<Object>} - 해당 응원 타입의 응원 메시지를 포함한 객체
 * @throws {BaseError} - 해당 응원 타입에 해당하는 메시지가 없을 경우 404 에러 발생
 */
export const selectCheerMessage = async (type) => {
    const query = `
    SELECT cheer_message 
    FROM cheer_type 
    WHERE type_name = ?;
    `;
    const result = await executeQuery(query, [type]);
    if (result.length === 0) { throwError(StatusCodes.NOT_FOUND, '해당 유형의 응원 메시지를 찾을 수 없습니다.'); }
    return result[0];
}

/**
 * 응원 타입 ID 조회
 * 
 * 주어진 응원 타입 (luck, love, fire, present 중 하나) 에 해당하는
 * cheer_type 테이블의 ID를 조회합니다.
 * 
 * @param {string} type - 응원 타입 이름
 * @returns {Promise<number>} - 응원 타입 ID
 * @throws {BaseError} - 응원 타입이 존재하지 않을 경우 에러 발생
 */
export const selectCheerTypeId = async (type) => {
    const query = `SELECT id FROM cheer_type WHERE type_name = ?`;
    const result = await executeQuery(query, [type]);
    if (result.length === 0) { throwError(StatusCodes.NOT_FOUND, '해당 응원 타입 id를 찾을 수 없습니다.'); }
    return result[0].id; // cheer_type의 id 반환
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
export const insertCheer = async (cheerData) => {
    const insertQuery = `INSERT INTO cheer (cheer_type_id, message, manitto_relation_id) VALUES (?, ?, ?)`;
    await executeQuery(insertQuery, [cheerData.typeId, cheerData.message, cheerData.manittoId]);
    const selectQuery = `
        SELECT COUNT(*) as count 
        FROM cheer 
        WHERE manitto_relation_id = ? 
        AND DATE(created_at) = CURDATE();
    `;
    const selectResult = await executeQuery(selectQuery, [cheerData.manittoId]);
    return selectResult[0].count;
}