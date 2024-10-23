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

/**
 * 유저 코드, 방 ID, 응원 타입, 메시지를 기반으로 응원을 보내는 함수
 * 
 * 주어진 유저 코드를 통해 유저 ID를 조회하고, 마니또 관계를 찾아서 
 * 해당 마니또 관계에 응원 메시지를 저장합니다.
 * 그리고 오늘 보낸 응원의 횟수를 반환합니다.
 * 
 * @param {string} userCode - 유저 코드 (user.code)
 * @param {number} roomId - 방 ID
 * @param {string} cheerType - 응원 타입 (luck, love, fire, present 중 하나)
 * @param {string} message - 응원 메시지
 * @returns {Promise<number>} - 오늘 보낸 응원의 횟수
 */
export const sendCheer = async ({ userCode, roomId, cheerType, message }) => {
    const userId = await selectUserIdByCode(userCode);
    const manittoId = await selectManittoId({ manittoUserId: userId, roomId });
    const cheerTypeId = await selectCheerTypeId(cheerType);
    const todaysCount = await insertCheer({ typeId: cheerTypeId, message, manittoId });
    return todaysCount;
}