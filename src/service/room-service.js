import { selectRoom, selectUserIdByCode } from '../dao/room-dao.js';

/**
 * 유저 코드로 방 정보를 검색하는 함수
 * @param {string} userCode - 유저의 랜덤 배정 코드 (user.code)
 * @returns {Promise<Array>} - 방 리스트
 */
export const searchRoom = async (userCode) => {
    const userId = await selectUserIdByCode(userCode); // 유저 코드로 유저 ID 가져오기
    return await selectRoom(userId); // 유저 ID를 사용하여 방 정보 가져오기
};

export const createRoom = async (userCode, roomName, endDate) => {
    let randomCode;
    const maxAttempts = 10;  // 중복 검사 시 최대 시도 횟수
    let attempt = 0;

    // 중복되지 않는 방 코드 생성 및 검증
    while (attempt < maxAttempts) {
        randomCode = "R" + generateRandomCode();

        // DB에서 해당 코드가 이미 존재하는지 확인
        const isExists = await isUserCodeExists(randomCode);
        if (!isExists) { break; }
        attempt++;
    }

    if (attempt === maxAttempts) {
        throwError(StatusCodes.INTERNAL_SERVER_ERROR, 'Room 코드를 생성할 수 없습니다.');
    }

    const userId = await selectUserIdByCode(userCode);
    return await insertRoom({ userId, roomCode: randomCode, roomName, endDate });
}