import { dbPool } from '../config/db-config.js';

// 유저 데이터를 DB에 저장
export const saveUser = async (userData) => {
    const query = 'INSERT INTO users (nickname, device_id, code) VALUES (?, ?, ?)';
    const [result] = await dbPool.execute(query, [userData.nickname, userData.deviceId, userData.userCode]);

    return result.insertId;  // 유저 ID 반환
};