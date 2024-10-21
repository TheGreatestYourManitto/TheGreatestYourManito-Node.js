import { saveUser } from '../dao/user-dao.js';

// 8자리 랜덤 코드 생성 함수
const generateRandomCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
};

export const createUser = async (nickname, deviceId) => {
    const randomCode = generateRandomCode();

    // DAO에 유저 저장
    await saveUser({ nickname, deviceId, userCode: randomCode });

    return randomCode;  // 생성된 유저 코드 반환
};