/**
 * 입력값 유효성 검사
 */
export const isValidTodoText = (text: string): boolean => {
  // 빈 문자열 또는 공백만 있는 경우 false
  return text.trim().length > 0 && text.trim().length <= 500;
};

/**
 * HTML 이스케이프 처리
 */
export const sanitizeText = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

