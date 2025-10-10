# 📝 TodoList 웹사이트 (with Supabase)

간단하고 직관적인 할 일 관리 웹 애플리케이션입니다. Supabase 백엔드를 사용하여 데이터를 저장합니다.

## ✨ 주요 기능

### MVP (Phase 1) 기능
- ✅ **할 일 추가**: 텍스트 입력으로 새로운 할 일 추가
- 📋 **할 일 목록 조회**: 추가된 모든 할 일을 목록으로 표시
- ✔️ **완료 처리**: 체크박스로 완료/미완료 상태 토글
- 🗑️ **할 일 삭제**: 개별 할 일 삭제
- ✏️ **할 일 수정**: 더블클릭하여 인라인 편집
- 💾 **데이터 영속성**: Supabase PostgreSQL 데이터베이스 저장
- 🎨 **필터링**: 전체/진행중/완료 상태별 필터링
- 🧹 **일괄 삭제**: 완료된 항목 일괄 삭제
- ☁️ **클라우드 저장**: 어디서나 접근 가능한 데이터

## 🛠️ 기술 스택

- **프레임워크**: React 18
- **언어**: TypeScript 5
- **빌드 도구**: Vite
- **스타일링**: CSS
- **상태 관리**: React Hooks (useState, useEffect)
- **백엔드**: Supabase (PostgreSQL)
- **인증**: Supabase Auth (향후 추가 예정)

## 📦 설치 및 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. Supabase 설정

#### 2.1 Supabase 테이블 생성

1. [Supabase 대시보드](https://ujlmunabhplxgpkueypg.supabase.co) 접속
2. 왼쪽 메뉴에서 **SQL Editor** 클릭
3. `supabase/migrations/001_create_todos_table.sql` 파일의 SQL 실행

자세한 내용은 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)를 참조하세요.

#### 2.2 환경 변수 확인

`.env.local` 파일이 자동으로 생성되어 있으며, 다음 내용이 포함되어 있습니다:

```
VITE_SUPABASE_URL=https://ujlmunabhplxgpkueypg.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 개발 서버 실행

```bash
npm run dev
```

개발 서버가 시작되면 브라우저에서 `http://localhost:5173`으로 접속하세요.

### 프로덕션 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 📁 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── Header.tsx      # 헤더 컴포넌트
│   ├── TodoInput.tsx   # 할 일 입력 컴포넌트
│   ├── TodoItem.tsx    # 할 일 항목 컴포넌트
│   ├── TodoList.tsx    # 할 일 목록 컴포넌트
│   └── TodoFilter.tsx  # 필터 컴포넌트
├── services/           # 서비스 레이어
│   └── supabaseStorageService.ts  # Supabase 서비스
├── hooks/              # 커스텀 Hook
│   └── useSupabaseTodos.ts  # Supabase Todo 상태 관리
├── lib/                # 라이브러리 설정
│   └── supabase.ts     # Supabase 클라이언트 설정
├── types/              # TypeScript 타입 정의
│   ├── todo.ts         # Todo 관련 타입
│   └── database.ts     # Database 타입
├── utils/              # 유틸리티 함수
│   ├── generateId.ts   # ID 생성 함수
│   └── validation.ts   # 유효성 검사 함수
├── styles/             # CSS 파일
│   ├── Header.css
│   ├── TodoInput.css
│   ├── TodoItem.css
│   ├── TodoList.css
│   └── TodoFilter.css
├── App.tsx             # 메인 App 컴포넌트
├── App.css             # App 스타일
├── index.css           # 전역 스타일
└── main.tsx            # 엔트리 포인트

supabase/
└── migrations/
    └── 001_create_todos_table.sql  # 데이터베이스 마이그레이션
```

## 🎯 사용 방법

1. **할 일 추가**: 상단 입력 필드에 할 일을 입력하고 Enter 키를 누르거나 "추가" 버튼을 클릭하세요.
2. **완료 처리**: 체크박스를 클릭하여 할 일을 완료로 표시하세요.
3. **수정**: 할 일 텍스트를 더블클릭하여 수정 모드로 진입하세요. Enter 키로 저장, Esc 키로 취소할 수 있습니다.
4. **삭제**: 각 할 일의 오른쪽에 있는 ✕ 버튼을 클릭하세요.
5. **필터링**: 하단의 "전체", "진행중", "완료" 버튼으로 할 일을 필터링하세요.
6. **일괄 삭제**: 완료된 항목이 있을 때 "완료된 항목 삭제" 버튼을 클릭하세요.

## 🎨 주요 기능 상세

### Supabase 클라우드 저장
- 모든 변경 사항이 실시간으로 Supabase PostgreSQL 데이터베이스에 저장됩니다.
- 어떤 기기에서든 동일한 데이터에 접근할 수 있습니다.
- 데이터가 안전하게 클라우드에 백업됩니다.

### 반응형 디자인
- 모바일, 태블릿, 데스크톱 모든 화면 크기에 최적화되어 있습니다.
- 터치 친화적인 인터페이스를 제공합니다.

### 키보드 단축키
- `Enter`: 할 일 추가 또는 수정 저장
- `Esc`: 수정 취소
- `Tab`: 요소 간 이동

## 🔮 향후 계획 (Phase 2+)

- ✅ Supabase 백엔드 연동 (완료)
- 사용자 인증 및 다중 사용자 지원
- 실시간 동기화
- 우선순위 설정 기능
- 카테고리/태그 기능
- 마감일 설정
- 드래그 앤 드롭으로 순서 변경
- 다크 모드
- PWA 지원

## 🗄️ 데이터베이스 스키마

### todos 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | UUID | 고유 ID (자동 생성) |
| text | TEXT | 할 일 내용 |
| completed | BOOLEAN | 완료 여부 |
| created_at | TIMESTAMPTZ | 생성 시간 (자동 생성) |
| updated_at | TIMESTAMPTZ | 수정 시간 (자동 업데이트) |
| user_id | UUID | 사용자 ID (향후 인증용) |

## 🔒 보안

- Row Level Security (RLS) 활성화
- 현재는 모든 작업 허용 (개발 모드)
- 프로덕션 환경에서는 인증 및 권한 관리 추가 예정

## 📄 라이선스

MIT License

## 👤 작성자

TodoList 웹사이트 개발팀

---

**Note**: 이 프로젝트는 PRD(Product Requirements Document)와 TRD(Technical Requirements Document)를 기반으로 개발되었으며, 로컬 스토리지에서 Supabase로 마이그레이션되었습니다.
