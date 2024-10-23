import { executeQuery } from '../../common/db-helper.js';

export const insertUserRoomSetting = async ({ userId, roomId, isDeleted }) => {
    const query = `INSERT INTO user_room_setting (user_id, room_id, is_deleted) VALUES (?, ?, ?)`;
    await executeQuery(query, [userId, roomId, isDeleted]);
}

export const selectUserRoomSetting = async (userId) => {
    const query = `SELECT room_id, is_deleted FROM user_room_setting WHERE user_id = ?`;
    const result = await executeQuery(query, [userId]);
    return result;
}