# monorepo-template

[English](README.md) | [한국어](README.ko.md)

Next.js 프론트엔드와 Hono API로 구성한 TypeScript 모노레포
템플릿입니다. pnpm workspace와 Turborepo로 관리합니다.

## 구성

| 영역        | 경로         | 기술                                           |
| ----------- | ------------ | ---------------------------------------------- |
| 웹          | `apps/web`   | Next.js, React, StyleX, TanStack Query, XState |
| API         | `apps/api`   | Hono, Node.js                                  |
| 도구        | `apps/*`     | 애플리케이션별 TypeScript, oxfmt, oxlint       |
| 실행 관리   | workspace    | pnpm workspace, Turborepo                      |
| 테스트      | `apps/web`   | Vitest, Playwright                             |
| 공통 패키지 | `packages/*` | 애플리케이션에서 공유할 코드를 위한 경로       |

## 요구사항

- 전역으로 설치한 [Nodeup](https://nodeup.delino.io/installation)
- `.node-version`에 고정된 Node.js
- `package.json`에 고정된 pnpm
- Docker Desktop 또는 Docker Compose v2를 지원하는 Docker Engine
  (로컬 오브젝트 스토리지를 사용할 때만 필요)

## 시작하기

Nodeup을 설치하고 shim 경로를 `PATH`에 추가한 뒤, clone 또는 worktree마다
저장소 설정을 한 번 실행합니다.

```bash
nodeup override set "$(<.node-version)"
nodeup shim setup
pnpm install
pnpm dev
```

Nodeup은 절대 경로를 기준으로 directory override를 저장하므로, clone이나
worktree를 새로 만들면 설정을 다시 실행해야 합니다.

Garage는 선택 사항이며 애플리케이션과 별도로 실행됩니다. 오브젝트
스토리지를 사용하는 작업에서는 먼저 Garage를 시작합니다.

```bash
pnpm storage:up
```

하나의 애플리케이션만 실행하려면 패키지 필터를 사용합니다.

```bash
pnpm --filter @repo/web dev
pnpm --filter api dev
```

## 명령어

| 명령어                | 용도                                     |
| --------------------- | ---------------------------------------- |
| `pnpm build`          | 모든 애플리케이션 빌드                   |
| `pnpm format`         | workspace 파일 포맷                      |
| `pnpm format:check`   | 포맷 검사                                |
| `pnpm lint`           | 엄격한 타입 인식 린트 실행               |
| `pnpm lint:fix`       | 자동 수정 가능한 린트 오류 수정          |
| `pnpm typecheck`      | 모든 애플리케이션 타입 검사              |
| `pnpm test`           | 테스트 한 번 실행                        |
| `pnpm test:watch`     | 테스트 watch 모드 실행                   |
| `pnpm test:coverage`  | 커버리지 보고서 생성                     |
| `pnpm test:e2e`       | Playwright 테스트를 headless 모드로 실행 |
| `pnpm test:e2e:ui`    | Playwright UI 실행                       |
| `pnpm storage:up`     | Garage를 시작하고 healthy 상태까지 대기  |
| `pnpm storage:down`   | 저장된 데이터를 보존하고 Garage 중지     |
| `pnpm storage:logs`   | Garage 로그 추적                         |
| `pnpm storage:status` | Garage 노드와 layout 상태 확인           |
| `pnpm storage:reset`  | 모든 로컬 오브젝트 스토리지 데이터 삭제  |

브라우저 테스트를 실행하기 전에 Chromium을 한 번 설치합니다.

```bash
pnpm --filter @repo/web exec playwright install chromium
```

## 로컬 오브젝트 스토리지

[Garage](https://garagehq.deuxfleurs.fr/)는 로컬 개발을 위한 S3 호환
오브젝트 스토리지를 제공합니다. Docker가 실행 중이어야 하며 `pnpm dev`는
Garage를 자동으로 시작하지 않습니다.

Garage를 시작하고 노드 상태를 확인합니다.

```bash
pnpm storage:up
pnpm storage:status
```

로컬 접속 기본값은 `.env.example`에 문서화되어 있습니다.

| 변수                               | 로컬 기본값                                                        |
| ---------------------------------- | ------------------------------------------------------------------ |
| `OBJECT_STORAGE_ENDPOINT`          | `http://127.0.0.1:3900`                                            |
| `OBJECT_STORAGE_REGION`            | `garage`                                                           |
| `OBJECT_STORAGE_BUCKET`            | `local-dev`                                                        |
| `OBJECT_STORAGE_ACCESS_KEY_ID`     | `GK0123456789abcdef0123456789abcdef`                               |
| `OBJECT_STORAGE_SECRET_ACCESS_KEY` | `0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef` |
| `OBJECT_STORAGE_FORCE_PATH_STYLE`  | `true`                                                             |

S3 endpoint는 `http://127.0.0.1:3900`, health endpoint는
`http://127.0.0.1:3903/health`입니다. 고정 자격 증명은 의도적으로 로컬
개발에서만 사용합니다. 서버 전용 설정으로 유지하고 `NEXT_PUBLIC_*`
변수로 노출하지 않습니다.

`pnpm storage:down`은 Garage 컨테이너와 네트워크를 제거하지만 named
volume은 보존합니다. `pnpm storage:reset`은 해당 volume을 삭제하므로
모든 로컬 오브젝트와 Garage 메타데이터가 영구적으로 제거됩니다. 다음에
Garage를 시작하면 개발 키와 `local-dev` 버킷이 다시 생성됩니다.

`.env`에서 초기 버킷이나 자격 증명을 변경해도 기존 Garage 메타데이터는
갱신되지 않습니다. 변경값을 적용하려면 `pnpm storage:reset`을
실행합니다.

이 단일 노드 구성은 replication factor가 1이며 중복성과 백업을
제공하지 않습니다. 폐기 가능한 로컬 개발 데이터에만 사용합니다. 이
구성은 AWS S3 또는 Cloudflare R2를 설정하지 않습니다.

## 규칙

- [프론트엔드 상태 및 데이터 흐름](docs/frontend/state-management.md)에서
  XState와 TanStack Query의 책임 경계를 정의합니다.
- 린트는 엄격한 타입 인식 검사를 수행하며 경고가 발생해도 실패합니다.

## 권장 배포 구성

앞에서 설명한 Garage 서비스는 로컬 개발 전용입니다. 이 템플릿으로 만든
프로젝트는 보통 다음 프로덕션 서비스를 사용합니다. 아래 서비스는 권장
사항이며 템플릿에 미리 설정되어 있지 않습니다.

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
