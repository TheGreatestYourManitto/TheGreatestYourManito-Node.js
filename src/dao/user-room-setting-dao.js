import { executeQuery } from '../../common/db-helper.js';

export const insertUserRoomSetting = async ({ userId, roomId, isDeleted }) => {
    const query = `INSERT INTO user_room_setting (user_id, room_id, is_deleted) VALUES (?, ?, ?)`;
    await executeQuery(query, [userId, roomId, isDeleted]);
}

export const updateUserRoomSetting = async ({ userId, roomId, isDeleted }) => {
    const query = `UPDATE user_room_setting SET is_deleted = ? WHERE user_id = ? AND room_id = ?`;
    await executeQuery(query, [isDeleted, userId, roomId]);
}

export const selectUserRoomSetting = async (userId) => {
    const query = `SELECT room_id, is_deleted FROM user_room_setting WHERE user_id = ?`;
    const result = await executeQuery(query, [userId]);
    return result;
}

export const isDeletedInRoomSetting = async (userId, roomId) => {
    const query = `SELECT is_deleted FROM user_room_setting WHERE user_id = ? AND room_id = ?`;
    const result = await executeQuery(query, [userId, roomId]);

    if (result.length > 0) { return result[0].is_deleted; }
    else { return null; }
}

export const deleteUserRoomSetting = async ({ userId, roomId }) => {
    const query = `DELETE FROM user_room_setting WHERE user_id = ? AND room_id = ?`;
    await executeQuery(query, [userId, roomId]);
}