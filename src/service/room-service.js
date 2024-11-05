import { StatusCodes } from 'http-status-codes';
import { generateUniqueRandomCode } from '../../common/code-generator.js';
import { throwError } from '../../common/response-helper.js';
import { checkRoomAdmin, countCheerByType, deleteRoomMember, getRoomManittoCheerSummary, insertManitto, insertRoom, isRoomCodeExists, selectManittoId, selectManittoInfo, selectRoom, selectRoomBy, selectRoomIdByCode, selectRoomInfo, selectUserIdByCode, selectUserIdFromManitto, updateManittoUserId, updateRoomStatus } from '../dao/room-dao.js';
import { shuffleArray } from '../../common/utils.js';
import { updateUserRoomSetting } from '../dao/user-room-setting-dao.js';

/**
 * 유저 코드로 방 정보를 검색하는 함수
 * 
 * 주어진 유저의 랜덤 배정 코드(user.code)를 기반으로 유저의 ID를 조회한 후, 
 * 유저가 관리자이거나 참여한 방 목록을 반환합니다.
 * 
 * @param {string} userCode - 유저의 랜덤 배정 코드 (user.code)
 * @returns {Promise<Array>} - 유저가 관리자이거나 참여한 방 리스트
 * @throws {BaseError} - 유저를 찾지 못했을 경우 에러를 던집니다.
 */
export const searchRoom = async (userCode) => {
    const userId = await selectUserIdByCode(userCode); // 유저 코드로 유저 ID 가져오기
    return await selectRoom(userId); // 유저 ID를 사용하여 방 정보 가져오기
};

export const searchRoomBy = async (roomId) => {
    return await selectRoomBy(roomId);
}

/**
 * 새로운 방을 생성하는 함수
 * 
 * 유저 코드로 유저 ID를 조회한 후, 새로운 방 코드를 생성하고,
 * 해당 유저가 관리자인 방을 DB에 추가합니다.
 * 
 * @param {string} userCode - 방을 생성하는 관리자의 유저 코드
 * @param {string} roomName - 생성할 방의 이름
 * @param {string} endDate - 방의 종료일 (ISO 8601 형식)
 * @returns {Promise<string>} - 생성된 방의 초대 코드 (invitation_code)
 * @throws {BaseError} - 방 초대 코드를 생성하지 못했거나 유저를 찾지 못한 경우 에러를 던집니다.
 */
export const createRoom = async (userCode, roomName, endDate) => {
    const randomCode = await generateUniqueRandomCode("R", isRoomCodeExists);
    const userId = await selectUserIdByCode(userCode);
    await insertRoom({ userId, roomCode: randomCode, roomName, endDate });
    return { invitationCode: randomCode, endDate }; // 생성된 방 코드, 종료일 반환
}

/**
 * 방 정보를 조회하는 서비스 함수
 * 
 * 주어진 유저 코드(userCode)와 방 ID(roomId)를 사용하여,
 * 유저 ID를 조회한 뒤, 해당 유저가 방에 속해 있는지 확인하고,
 * 방 정보와 방에 속한 유저 목록, 관리자 여부를 조회하여 반환합니다.
 * 
 * @param {string} userCode - 유저의 랜덤 배정 코드 (user.code)
 * @param {number} roomId - 방 ID
 * @returns {Promise<Object>} - 방 정보, 관리자 여부, 유저 목록을 포함한 객체
 * @throws {BaseError} - 유저를 찾지 못했거나 방 정보를 조회하는 과정에서 문제가 발생할 경우 에러를 던집니다.
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
export const searchRoomInfo = async (userCode, roomId) => {
    const userId = await selectUserIdByCode(userCode);
    const roomInfo = await selectRoomInfo({ userId, roomId });
    return roomInfo;
}

/**
 * 유저가 방에 참여하는 함수
 * 
 * 주어진 유저 코드(userCode)와 초대 코드(invitationCode)를 사용하여,
 * 유저 ID와 방 ID를 조회한 후, 해당 유저를 방에 참여시킵니다.
 * 
 * @param {string} userCode - 유저의 랜덤 배정 코드 (user.code)
 * @param {string} invitationCode - 방의 초대 코드 (invitation_code)
 * @returns {Promise<number>} - 생성된 마니또 관계 (방-유저)의 ID
 * @throws {BaseError} - 방 초대 코드를 찾지 못했거나 유저를 찾지 못한 경우 에러를 던집니다.
 */
export const participateRoom = async (userCode, invitationCode) => {
    const userId = await selectUserIdByCode(userCode);
    const roomId = await selectRoomIdByCode(invitationCode);
    const manittoId = await insertManitto({ userId, roomId });
    return manittoId; // 생성된 마니또 관계 (방-유저) 반환
}

/**
 * 방 멤버를 삭제하는 함수 (관리자만 가능)
 * 
 * 주어진 유저 코드(userCode)를 통해 방의 관리자 여부를 확인한 후,
 * 삭제할 유저 ID가 방장 자신인 경우 삭제가 불가능하도록 에러를 발생시킵니다.
 * 방장 확인 후, 멤버를 비활성화(삭제) 처리합니다.
 * 
 * @param {string} userCode - 방 관리자의 유저 코드 (user.code)
 * @param {number} roomId - 방 ID
 * @param {number} userId - 삭제할 유저의 ID
 * @returns {Promise<Object>} - 삭제 결과
 * @throws {BaseError} - 방장이 자기 자신을 삭제하려고 하거나, 방장이 아닌 경우, 또는 삭제할 유저가 없을 경우 에러 발생
 */
export const removeRoomMember = async (userCode, roomId, userId) => {
    const adminUserId = await selectUserIdByCode(userCode);
    if (adminUserId == userId) { throwError(StatusCodes.BAD_REQUEST, '방장은 자기 자신을 삭제할 수 없습니다.'); }
    await checkRoomAdmin({ adminUserId, roomId });
    const result = await deleteRoomMember({ roomId, userId });
    return result;
}

/**
 * 방 상태를 확정하는 함수
 * 
 * 주어진 유저 코드(userCode)를 통해 방 관리자 여부를 확인한 후,
 * 방의 상태를 확정(is_confirmed 필드를 true로 업데이트)하고,
 * 마니또 매칭 프로세스를 시작합니다.
 * 
 * @param {string} userCode - 방 관리자의 유저 코드 (user.code)
 * @param {number} roomId - 방 ID
 * @returns {Promise<Object>} - 방 상태 업데이트 결과
 * @throws {BaseError} - 방 관리자가 아니거나 방이 존재하지 않는 경우 에러 발생
 */
export const confirmRoomStatus = async (userCode, roomId) => {
    const userId = await selectUserIdByCode(userCode);
    await checkRoomAdmin({ adminUserId: userId, roomId });
    const result = await updateRoomStatus({ userId, roomId });
    await startManittoProcess(roomId);
    return result;
}

/**
 * 마니또 매칭 프로세스를 실행하는 함수
 * 
 * 주어진 방 ID(roomId)를 기반으로 해당 방의 유저 목록을 가져와,
 * 각 유저에게 랜덤하게 마니또를 매칭합니다. 단, 각 유저가
 * 자기 자신을 마니또로 가질 수 없도록 무작위로 배열을 섞습니다.
 * 
 * @param {number} roomId - 방 ID
 * @returns {Promise<Array>} - 마니또 매칭 결과 리스트
 * @throws {BaseError} - 방에 유저가 없거나 매칭된 유저 정보 업데이트 실패 시 에러 발생
 */
const startManittoProcess = async (roomId) => {
    const userResult = await selectUserIdFromManitto(roomId);
    const userIds = userResult.map(row => row.user_id);

    let shuffledIds = shuffleArray([...userIds]); // 매칭용 셔플 배열

    // userIds[x].user_id == shuffledIds[x].user_id가 되지 않게 셔플
    while (shuffledIds.some((shuffledId, index) => shuffledId === userIds[index])) {
        shuffledIds = shuffleArray([...userIds]);
    }

    const manittoResult = await Promise.all(userIds.map((userId, index) => {
        const manittoUserId = shuffledIds[index];
        return updateManittoUserId({ roomId, userId, manittoUserId });
    }));

    return manittoResult;
}

/**
 * 유저의 마니또 상대 정보를 조회하는 함수
 * 
 * 주어진 유저 코드(userCode)를 기반으로 해당 유저의 ID를 조회한 후, 
 * 해당 유저가 속한 방(roomId)에서 마니또로 매칭된 상대의 정보를 조회하여 반환합니다.
 * 
 * @param {string} userCode - 유저의 랜덤 배정 코드
 * @param {number} roomId - 방 ID
 * @returns {Promise<Object>} - 매칭된 마니또 상대의 ID와 닉네임
 * @throws {BaseError} - 유저나 마니또 정보를 찾지 못했을 경우 에러 발생
 */
export const searchManitto = async (userCode, roomId) => {
    const userId = await selectUserIdByCode(userCode);
    const user = await selectManittoInfo({ userId, roomId });
    return user;
}

/**
 * 방을 삭제(비활성화)하는 함수
 * 
 * 주어진 유저 코드와 방 ID를 통해, 해당 유저의 방 설정을 업데이트하여 방을 비활성화합니다.
 * 즉, 방을 "삭제" 상태로 처리합니다.
 * 
 * @param {string} userCode - 유저의 랜덤 배정 코드 (user.code)
 * @param {number} roomId - 방 ID
 * @returns {Promise<void>} - 성공 시 아무런 값을 반환하지 않습니다.
 * @throws {BaseError} - 유저를 찾지 못하거나 방 설정을 업데이트하는 과정에서 에러 발생 시 에러를 던집니다.
 */
export const removeRoom = async (userCode, roomId) => {
    const userId = await selectUserIdByCode(userCode);
    await updateUserRoomSetting({ userId, roomId, isDeleted: true });
    return;
}


/**
 * 마니또 결과를 조회하는 함수
 * 
 * 주어진 유저 코드와 방 ID를 통해, 해당 유저의 마니또 정보를 조회하고, 마니또 응원 메시지의 카운트를 확인합니다.
 * 또한 방에 속한 모든 유저의 마니또 응원 현황을 집계하여 랭킹을 반환합니다.
 * 
 * @param {string} userCode - 유저의 랜덤 배정 코드 (user.code)
 * @param {number} roomId - 방 ID
 * @returns {Promise<Object>} - 유저의 마니또 정보, 응원 카운트, 그리고 마니또 랭킹을 포함한 객체를 반환합니다.
 * @throws {BaseError} - 유저를 찾지 못했거나 마니또 정보를 조회하는 과정에서 에러 발생 시 에러를 던집니다.
 */
export const getManittoResult = async (userCode, roomId) => {
    const userId = await selectUserIdByCode(userCode);
    const manittoInfo = await selectManittoInfo({ userId, roomId }); // 현재 유저의 마니또 정보
    const manittoId = await selectManittoId({ manittoUserId: manittoInfo.id, roomId })
    const cheerCounts = await countCheerByType({ manittoId });  // 응원 카운트
    const manittoSummary = await getRoomManittoCheerSummary(roomId); // 전체 마니또 랭킹 정보
    const manittoRank = manittoSummary.map((item, index) => ({
        rank: index + 1,
        userId: item.user_id,
        userName: item.userName,
        manittoUserId: item.manitto_user_id,
        manittoUserName: item.manittoUserName,
        cheerCount: item.cheer_count
    }));

    return {
        manitto: {
            userName: manittoInfo.nickname,
            userId: manittoInfo.id,
        },
        cheerCounts: cheerCounts,
        manittoRank: manittoRank
    };
}