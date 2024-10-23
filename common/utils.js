/**
 * 배열의 요소를 무작위로 섞는 함수
 * 
 * 주어진 배열(array)의 요소들을 무작위로 섞어 반환합니다.
 * Fisher-Yates (Knuth) 알고리즘을 사용하여 배열을 효과적으로 셔플합니다.
 * 
 * @param {Array} array - 셔플할 배열
 * @returns {Array} - 무작위로 섞인 배열
 */
export const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};