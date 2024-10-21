export const BaseError = (data) => {
    const error = new Error(data.message);  // 기본 Error 객체 생성
    error.data = data;  // 추가 데이터 설정
    return error;
};