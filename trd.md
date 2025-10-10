# Technical Requirements Document (TRD)
# TodoList 웹사이트

## 1. 기술 스택

### 1.1 프론트엔드
- **프레임워크**: React 18+ (또는 Vue 3, Vanilla JS)
- **언어**: TypeScript 5+
- **스타일링**: CSS Modules / Styled Components / Tailwind CSS
- **빌드 도구**: Vite / Create React App
- **상태 관리**: React Hooks (useState, useEffect, useContext) 또는 Zustand

### 1.2 개발 도구
- **패키지 매니저**: npm / yarn / pnpm
- **코드 포매터**: Prettier
- **린터**: ESLint
- **버전 관리**: Git

### 1.3 호스팅
- **배포 플랫폼**: Vercel / Netlify / GitHub Pages
- **CDN**: 플랫폼 기본 CDN 활용

## 2. 시스템 아키텍처

### 2.1 전체 구조
```
┌─────────────────────────────────────┐
│         Browser (Client)            │
│  ┌───────────────────────────────┐  │
│  │      React Application        │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │    UI Components        │  │  │
│  │  └─────────────────────────┘  │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │   State Management      │  │  │
│  │  └─────────────────────────┘  │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │   Storage Service       │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
│              ↕                      │
│  ┌───────────────────────────────┐  │
│  │    Local Storage (5MB)        │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 2.2 컴포넌트 구조
```
App
├── Header
├── TodoInput
├── TodoList
│   └── TodoItem (multiple)
│       ├── Checkbox
│       ├── TodoText
│       └── DeleteButton
└── TodoFilter (optional, Phase 2)
```

## 3. 데이터 모델

### 3.1 Todo 데이터 구조
```typescript
interface Todo {
  id: string;              // UUID 또는 timestamp 기반 고유 ID
  text: string;            // 할 일 내용 (최대 500자)
  completed: boolean;      // 완료 여부
  createdAt: number;       // 생성 시간 (timestamp)
  updatedAt: number;       // 수정 시간 (timestamp)
  // Phase 2 추가 필드
  priority?: 'high' | 'medium' | 'low';
  category?: string;
  dueDate?: number;        // 마감일 (timestamp)
}
```

### 3.2 애플리케이션 상태
```typescript
interface AppState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';  // Phase 2
  isLoading: boolean;
}
```

## 4. API 설계 (로컬 스토리지)

### 4.1 Storage Service Interface
```typescript
interface StorageService {
  // 모든 할 일 가져오기
  getTodos(): Promise<Todo[]>;
  
  // 할 일 추가
  addTodo(text: string): Promise<Todo>;
  
  // 할 일 수정
  updateTodo(id: string, updates: Partial<Todo>): Promise<Todo>;
  
  // 할 일 삭제
  deleteTodo(id: string): Promise<void>;
  
  // 완료 상태 토글
  toggleTodo(id: string): Promise<Todo>;
  
  // 모든 할 일 삭제
  clearTodos(): Promise<void>;
  
  // 완료된 할 일만 삭제
  clearCompleted(): Promise<void>;
}
```

### 4.2 로컬 스토리지 키
```typescript
const STORAGE_KEY = 'todolist_data';
const STORAGE_VERSION = 'v1';
```

### 4.3 데이터 구조 예시
```json
{
  "version": "v1",
  "lastModified": 1696849200000,
  "todos": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "text": "프로젝트 문서 작성",
      "completed": false,
      "createdAt": 1696849200000,
      "updatedAt": 1696849200000
    }
  ]
}
```

## 5. 주요 기능 구현 방법

### 5.1 할 일 추가
1. 사용자가 입력 필드에 텍스트 입력
2. Enter 키 또는 추가 버튼 클릭
3. 입력값 유효성 검사 (빈 문자열, 공백만 있는 경우 제외)
4. 새로운 Todo 객체 생성 (고유 ID, timestamp 등)
5. 상태에 추가 및 로컬 스토리지 저장
6. 입력 필드 초기화

### 5.2 할 일 완료 처리
1. 체크박스 클릭 이벤트 핸들링
2. 해당 Todo의 completed 상태 토글
3. updatedAt 타임스탬프 갱신
4. 로컬 스토리지 업데이트
5. UI 업데이트 (취소선, 색상 변경 등)

### 5.3 할 일 삭제
1. 삭제 버튼 클릭 이벤트 핸들링
2. 해당 ID의 Todo 필터링하여 제거
3. 로컬 스토리지 업데이트
4. 삭제 애니메이션 (선택적)

### 5.4 할 일 수정
1. Todo 텍스트 클릭으로 편집 모드 진입
2. 텍스트가 input 또는 contentEditable로 변경
3. 사용자 수정 후 Enter (저장) 또는 Esc (취소)
4. 유효성 검사 후 상태 및 로컬 스토리지 업데이트

### 5.5 데이터 동기화
1. 컴포넌트 마운트 시 로컬 스토리지에서 데이터 로드
2. 모든 변경 사항을 즉시 로컬 스토리지에 반영
3. 에러 발생 시 이전 상태로 롤백

## 6. 에러 처리

### 6.1 로컬 스토리지 에러
- 스토리지 용량 초과: 사용자에게 알림, 오래된 항목 삭제 제안
- 액세스 거부: 쿠키/스토리지 활성화 안내
- 파싱 에러: 데이터 초기화 또는 복구 시도

### 6.2 입력 유효성 검사
- 빈 문자열: 조용히 무시 (사용자에게 알림 없음)
- 너무 긴 텍스트: 최대 길이 제한 (500자)
- 특수 문자: HTML 이스케이프 처리

### 6.3 예외 상황 처리
```typescript
try {
  // 로컬 스토리지 작업
} catch (error) {
  console.error('Storage error:', error);
  // 사용자에게 친화적인 에러 메시지 표시
  // 대체 동작 수행 (메모리에만 저장 등)
}
```

## 7. 성능 최적화

### 7.1 렌더링 최적화
- React.memo를 활용한 불필요한 리렌더링 방지
- useMemo, useCallback으로 연산 및 함수 메모이제이션
- 가상 스크롤링 (항목이 매우 많을 경우, Phase 2)

### 7.2 로컬 스토리지 최적화
- Debounce를 활용한 저장 빈도 제한
- 변경된 데이터만 업데이트
- 대용량 데이터 압축 (필요시)

### 7.3 번들 크기 최적화
- Tree shaking 활용
- 코드 스플리팅 (필요시)
- 불필요한 의존성 제거

### 7.4 애니메이션 최적화
- CSS transform 및 opacity 활용 (GPU 가속)
- requestAnimationFrame 사용
- 부드러운 전환 효과 (300ms 이하)

## 8. 보안 고려사항

### 8.1 XSS 방지
- 사용자 입력 sanitization
- React의 기본 XSS 보호 활용
- dangerouslySetInnerHTML 사용 금지

### 8.2 데이터 검증
- 로컬 스토리지에서 불러온 데이터 타입 검증
- 손상된 데이터 감지 및 복구

### 8.3 HTTPS
- 배포 시 HTTPS 강제 사용

## 9. 테스트 전략

### 9.1 단위 테스트
- 개별 컴포넌트 테스트 (Jest + React Testing Library)
- 스토리지 서비스 로직 테스트
- 유틸리티 함수 테스트

### 9.2 통합 테스트
- 사용자 플로우 테스트
- 로컬 스토리지 연동 테스트

### 9.3 E2E 테스트 (선택적)
- Playwright 또는 Cypress를 활용한 전체 시나리오 테스트

### 9.4 테스트 커버리지 목표
- 핵심 로직: 80% 이상
- UI 컴포넌트: 60% 이상

## 10. 브라우저 호환성

### 10.1 지원 브라우저
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 10.2 Polyfills
- 필요시 core-js 활용
- Babel 설정으로 구형 브라우저 지원

## 11. 개발 환경 설정

### 11.1 프로젝트 초기화
```bash
# Vite + React + TypeScript
npm create vite@latest todolist -- --template react-ts
cd todolist
npm install
```

### 11.2 필수 의존성
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.0.0"
  }
}
```

### 11.3 개발 스크립트
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\""
  }
}
```

## 12. 배포 전략

### 12.1 빌드 프로세스
1. 린트 및 타입 체크
2. 프로덕션 빌드 생성
3. 번들 크기 확인
4. 자동 배포 (CI/CD)

### 12.2 Vercel 배포 설정
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### 12.3 환경 변수
- 개발: `.env.development`
- 프로덕션: `.env.production`

## 13. 모니터링 및 로깅

### 13.1 에러 추적
- Console.log를 활용한 개발 중 디버깅
- Sentry (선택적, Phase 2)

### 13.2 분석
- Google Analytics (선택적)
- 사용자 행동 추적 (프라이버시 고려)

## 14. 확장성 고려사항

### 14.1 백엔드 연동 준비
- API 호출을 위한 서비스 레이어 분리
- Storage Service를 인터페이스로 설계하여 교체 용이하게

### 14.2 데이터 마이그레이션
- 버전 관리를 통한 스키마 변경 대응
- 자동 마이그레이션 스크립트

### 14.3 다국어 지원 준비
- i18n 라이브러리 도입 고려
- 텍스트 하드코딩 최소화

## 15. 코드 구조 예시

```
src/
├── components/
│   ├── Header.tsx
│   ├── TodoInput.tsx
│   ├── TodoList.tsx
│   ├── TodoItem.tsx
│   └── TodoFilter.tsx
├── services/
│   └── storageService.ts
├── hooks/
│   ├── useTodos.ts
│   └── useLocalStorage.ts
├── types/
│   └── todo.ts
├── utils/
│   ├── generateId.ts
│   └── sanitize.ts
├── styles/
│   └── global.css
├── App.tsx
└── main.tsx
```

## 16. 성능 벤치마크

### 16.1 목표 지표
- First Contentful Paint: < 1.5s
- Time to Interactive: < 2.5s
- Lighthouse Score: > 90

### 16.2 최적화 체크리스트
- [ ] 이미지 최적화 (WebP)
- [ ] 번들 크기 최소화 (< 200KB gzipped)
- [ ] 레이지 로딩 적용
- [ ] 캐싱 전략 수립

