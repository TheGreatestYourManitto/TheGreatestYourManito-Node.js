import { insertCheer, selectCheerMessage, selectCheerTypeId } from "../dao/cheer-dao.js";
import { selectManittoId, selectUserIdByCode } from "../dao/room-dao.js";

/**
 * 응원 메시지를 검색하는 함수
 * 
 * 주어진 응원 타입(cheerType)에 해당하는 응원 메시지를 DB에서 조회한다.
 * 
 * @param {string} type - 응원 타입 (예: 'luck', 'love', 'fire', 'present')
 * @returns {Promise<Object>} - 해당 응원 타입의 메시지 객체를 반환
 * @throws {BaseError} - 해당 응원 타입에 해당하는 메시지가 없을 경우 404 에러 발생
 */
export const searchCheerMessage = async (type) => {
    const message = await selectCheerMessage(type);
    return message;
}

export const sendCheer = async ({ userCode, roomId, cheerType, message }) => {
    const userId = await selectUserIdByCode(userCode);
    const manittoId = await selectManittoId({ manittoUserId: userId, roomId });
    const cheerTypeId = await selectCheerTypeId(cheerType);
    const todaysCount = await insertCheer({ typeId: cheerTypeId, message, manittoId });
    return todaysCount;
}