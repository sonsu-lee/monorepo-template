# monorepo-template

[English](README.md) | [한국어](README.ko.md)

Next.js 프론트엔드와 Hono API로 구성한 TypeScript 모노레포
템플릿입니다. pnpm workspace와 Turborepo로 관리합니다.

## 구성

| 영역        | 경로         | 기술                                           |
| ----------- | ------------ | ---------------------------------------------- |
| 웹          | `apps/web`   | Next.js, React, StyleX, TanStack Query, XState |
| API         | `apps/api`   | Hono, Node.js                                  |
| 도구        | workspace    | Turborepo, TypeScript, oxfmt, oxlint           |
| 테스트      | `apps/web`   | Vitest, Playwright                             |
| 공통 패키지 | `packages/*` | 애플리케이션에서 공유할 코드를 위한 경로       |

## 요구사항

- Node.js 24 LTS (`24.18.1` 이상인 24.x 버전)
- pnpm `11.18.0`

## 시작하기

```bash
pnpm install
pnpm dev
```

하나의 애플리케이션만 실행하려면 패키지 필터를 사용합니다.

```bash
pnpm --filter @repo/web dev
pnpm --filter api dev
```

## 명령어

| 명령어               | 용도                                     |
| -------------------- | ---------------------------------------- |
| `pnpm build`         | 모든 애플리케이션 빌드                   |
| `pnpm format`        | workspace 파일 포맷                      |
| `pnpm format:check`  | 포맷 검사                                |
| `pnpm lint`          | 엄격한 타입 인식 린트 실행               |
| `pnpm lint:fix`      | 자동 수정 가능한 린트 오류 수정          |
| `pnpm typecheck`     | 모든 애플리케이션 타입 검사              |
| `pnpm test`          | 테스트 한 번 실행                        |
| `pnpm test:watch`    | 테스트 watch 모드 실행                   |
| `pnpm test:coverage` | 커버리지 보고서 생성                     |
| `pnpm test:e2e`      | Playwright 테스트를 headless 모드로 실행 |
| `pnpm test:e2e:ui`   | Playwright UI 실행                       |

브라우저 테스트를 실행하기 전에 Chromium을 한 번 설치합니다.

```bash
pnpm --filter @repo/web exec playwright install chromium
```

## 규칙

- [프론트엔드 상태 및 데이터 흐름](docs/frontend/state-management.md)에서
  XState와 TanStack Query의 책임 경계를 정의합니다.
- 린트는 엄격한 타입 인식 검사를 수행하며 경고가 발생해도 실패합니다.

## 권장 배포 구성

이 템플릿으로 만든 프로젝트는 보통 다음 프로덕션 서비스를 사용합니다.
아래 서비스는 권장 사항이며 템플릿에 미리 설정되어 있지 않습니다.

| 영역              | 서비스              | 용도                                           |
| ----------------- | ------------------- | ---------------------------------------------- |
| 프론트엔드        | Cloudflare Workers  | OpenNext를 통한 Next.js 애플리케이션 배포      |
| 백엔드            | Railway             | Hono API를 지속 실행되는 Node.js 서비스로 운영 |
| 데이터베이스      | Railway PostgreSQL  | 트랜잭션 애플리케이션 데이터 저장              |
| 오브젝트 스토리지 | Cloudflare R2       | 업로드 파일과 오브젝트 저장                    |
| 오류 모니터링     | Sentry              | 프론트엔드와 백엔드 오류 수집                  |
| 업타임 및 알림    | Better Stack        | 공개 웹과 API 헬스 체크 감시                   |
| 메트릭            | Railway 기본 메트릭 | 초기 프로덕션 리소스 사용량 확인               |

다음 서비스는 프로젝트에 필요한 경우에만 추가합니다.

| 필요한 기능                               | 서비스           |
| ----------------------------------------- | ---------------- |
| 공유 캐시, 요청 제한, 잠금 또는 세션      | Upstash Redis    |
| Prometheus 호환 메트릭과 Grafana 대시보드 | Grafana Cloud    |
| 대용량 이벤트, 로그 또는 제품 분석        | ClickHouse Cloud |
