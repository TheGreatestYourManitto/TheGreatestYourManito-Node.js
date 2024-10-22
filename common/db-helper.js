import { StatusCodes } from "http-status-codes";
import { throwError } from './error-helper.js';
import { dbPool } from "./config/db-config.js";

/**
 * 데이터베이스 쿼리를 실행하는 함수
 * 
 * 주어진 쿼리와 파라미터로 MySQL 데이터베이스에 쿼리를 실행하고, 결과를 반환합니다.
 * 
 * - `SELECT` 쿼리: 행(Row)들의 배열을 반환합니다. 각 행은 객체로 표현되며, 배열의 첫 번째 요소부터 접근할 수 있습니다.
 *   예: `const rows = await executeQuery(query); console.log(rows[0].columnName);`
 * 
 * - `INSERT` 쿼리: 단일 객체를 반환하며, 해당 객체에는 `insertId`, `affectedRows`와 같은 정보가 포함됩니다.
 *   예: `const result = await executeQuery(query); console.log(result.insertId);`
 * 
 * - `UPDATE`, `DELETE` 쿼리: 단일 객체를 반환하며, `affectedRows` 속성을 통해 영향을 받은 행의 수를 확인할 수 있습니다.
 *   예: `const result = await executeQuery(query); console.log(result.affectedRows);`
 * 
 * - DDL 쿼리 (`CREATE`, `ALTER`, `DROP`): 단일 객체를 반환하며, 작업의 성공 여부는 `affectedRows` 또는 `warningCount` 등을 통해 확인할 수 있습니다.
 *   예: `const result = await executeQuery(query); console.log(result.affectedRows);`
 * 
 * - 트랜잭션 쿼리 (`BEGIN`, `COMMIT`, `ROLLBACK`): 성공 여부에 대한 간단한 결과를 반환합니다.
 *   예: `await executeQuery('COMMIT');`
 * 
 * 에러가 발생할 경우, BaseError를 통해 에러 처리를 수행합니다.
 * 
 * @param {string} query - 실행할 SQL 쿼리
 * @param {Array} params - 쿼리에서 사용할 파라미터 배열 (기본값은 빈 배열)
 * @returns {Promise<Array|Object>} - 쿼리 실행 결과로 반환된 행(Row)들의 배열 또는 단일 객체
 * @throws {BaseError} - DB 작업 중 에러가 발생하면 에러를 던집니다.
 */
export const executeQuery = async (query, params = []) => {
    try {
        const [result] = await dbPool.execute(query, params);
        return result;
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            // UNIQUE 제약 조건 위반 시 에러
            throw new BaseError(responseStatus(StatusCodes.CONFLICT, '이미 DB에 존재하는 중복된 값이 있습니다.'));
        } else {
            console.error("DB 작업 중 에러 발생:", err);
            throwError(StatusCodes.INTERNAL_SERVER_ERROR, 'DB 작업 중 에러가 발생했습니다.');
        }
    }
};