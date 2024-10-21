import { executeQuery } from '../../common/db-helper.js';

/**
 * 유저 코드의 중복 여부를 확인하는 함수
 * 
 * @param {string} userCode - 중복 여부를 확인할 유저 코드
 * @returns {boolean} - 중복된 유저 코드가 있으면 true, 없으면 false
 */
export const isUserCodeExists = async (userCode) => {
    const query = 'SELECT COUNT(*) as count FROM users WHERE code = ?';
    const result = await executeQuery(query, [userCode]);
    return result[0].count > 0;
};

/**
 * 유저 데이터를 DB에 저장하는 함수
 * 
 * @param {Object} userData - 저장할 유저 데이터 (nickname, deviceId, userCode)
 * @param {string} userData.nickname - 유저의 닉네임
 * @param {string} userData.deviceId - 유저의 디바이스 ID
 * @param {string} userData.userCode - 생성된 유저 코드
 * @returns {number} - 저장된 유저의 ID
 */
export const insertUser = async (userData) => {
    const query = 'INSERT INTO users (nickname, device_id, code) VALUES (?, ?, ?)';
    const result = await executeQuery(query, [userData.nickname, userData.deviceId, userData.userCode]);
    return result.insertId;
};