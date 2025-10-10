# Supabase 설정 가이드

## 1. Supabase 테이블 생성

Supabase 프로젝트에 todos 테이블을 생성해야 합니다.

### 방법 1: Supabase 대시보드 사용

1. Supabase 대시보드 접속: https://ujlmunabhplxgpkueypg.supabase.co
2. 왼쪽 메뉴에서 **SQL Editor** 클릭
3. **New query** 버튼 클릭
4. 아래 SQL 코드를 복사하여 붙여넣기
5. **Run** 버튼 클릭

### SQL 스크립트

```sql
-- Create todos table
CREATE TABLE IF NOT EXISTS public.todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID DEFAULT NULL
);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON public.todos(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for now, without authentication)
CREATE POLICY "Allow all operations on todos"
ON public.todos
FOR ALL
USING (true)
WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_todos_updated_at
BEFORE UPDATE ON public.todos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

## 2. 환경 변수 확인

`.env.local` 파일에 다음 환경 변수가 설정되어 있는지 확인하세요:

```
VITE_SUPABASE_URL=https://ujlmunabhplxgpkueypg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqbG11bmFiaHBseGdwa3VleXBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwOTkxNTYsImV4cCI6MjA3NTY3NTE1Nn0.FNxZ9GmSL3JDYwbdmAkCnJ0xu59XrsNihK3bOpUVHXM
```

## 3. 애플리케이션 실행

```bash
npm run dev
```

## 4. 테이블 구조

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | UUID | 고유 ID (자동 생성) |
| text | TEXT | 할 일 내용 |
| completed | BOOLEAN | 완료 여부 |
| created_at | TIMESTAMPTZ | 생성 시간 (자동 생성) |
| updated_at | TIMESTAMPTZ | 수정 시간 (자동 업데이트) |
| user_id | UUID | 사용자 ID (선택, 향후 인증 기능용) |

## 5. 보안 정책

현재는 인증 없이 모든 작업을 허용하는 정책이 설정되어 있습니다.  
프로덕션 환경에서는 사용자 인증을 추가하고 보안 정책을 강화해야 합니다.

## 6. 문제 해결

### 테이블이 생성되지 않는 경우
- Supabase 대시보드의 Table Editor에서 `todos` 테이블이 있는지 확인
- SQL Editor에서 에러 메시지 확인

### 연결 에러가 발생하는 경우
- `.env.local` 파일의 URL과 Key가 올바른지 확인
- 개발 서버를 재시작: `npm run dev`

