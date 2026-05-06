# PRD

## 1. Overview

E-Raport Pesantren is a unified raport management platform tailored for pesantren that consolidates academic assessment, tahfiz/religious conduct, attendance, and extracurriculars into a verifiable workflow: Guru Mapel → Wali Kelas → Super Admin. The product reduces data duplication and errors via standardized templates and a smart import/export pipeline (download template → map → preview → partial import → error report). It supports instant role-switching on the dashboard, audit trails, notifications, and PDF/CSV export for official distribution.

Goals

- Replace manual raport spreadsheets with one auditable workflow.
- Provide safe mass-migration tools (mapping, preview, partial import).
- Reduce approval time via role-switching and notifications.
- Provide printable/exportable official raport PDFs and downloadable archives.

Success metrics (Phase 1)

- Time-to-verify per raport reduced by 40% vs manual process.
- Import success rate (valid rows) > 95% with detailed error reports for failures.
- 100% of raport PDFs generated available for download & archived to S3.

## 2. Requirements

Functional (MVP)

- Role-based access: Super Admin, Wali Kelas, Guru Mapel, Read-only Wali Santri.
- Assessment entry: subjects, tahfiz, sikap/ibadah, attendance, extracurricular.
- Assessment evidence attachment per grade (file upload).
- Multi-stage approval workflow: Guru Mapel → Wali Kelas → Super Admin, with audit logs.
- Instant role-switching on the dashboard (no logout).
- Smart import/export:
    - Download template by data-type (students, subject grades, tahfiz, attendance).
    - Column mapping UI, preview, validation, partial import, row-level error report.
- Notifications via email when action required and when raport published.
- PDF generation (print-ready) and CSV export of raport.
- Storage of generated PDFs and raw import files in S3-compatible storage.
- Audit trail for all edits/approvals with timestamps and actor IDs.

Non-functional

- Tech stack: React + Next.js + Tailwind; Node.js + Express + TypeScript backend; MySQL / MariaDB managed DB; S3 for files; deploy on Heroku/Render/Railway.
- Authentication/session: JWT + server session store; role-switching token must be auditable.
- Performance: generate single raport PDF < 10s; import preview for 1000 rows < 10s (async jobs where needed).
- Security: TLS, RBAC, input validation, file-type/size checks, encryption at rest for sensitive data.
- Compliance: data retention policy configurable, backups daily.

Phase 1 Scope

- All core workflows listed above.
- Simplified wali santri read interface (no heavy reporting dashboards).
- SendGrid integration for email notifications (see Section 5).

Out of scope for Phase 1

- Mobile apps (responsive web only).
- SMS notifications (can be added later).
- Advanced analytics/dashboard beyond basic counts.

## 3. Core Features

1. Role-Based Dashboard & Role-Switching
    - Instant UI role-swap dropdown (Super Admin / Wali Kelas / Guru Mapel).
    - Audit log entry on every role switch: {user_id, from_role, to_role, timestamp}.
    - Acceptance: role switch persists for session; role actions are logged.

2. Multi-Stage Assessment Workflow
    - Create/Edit assessments (scores, comments, attachments).
    - Submit → Wali Kelas verifies → Super Admin publishes.
    - Rejection with required-change comments and tracked versioning.

3. Smart Import/Export Pipeline
    - Download template generator by data type.
    - Upload CSV/Excel; preview first N rows, auto-detect columns, manual mapping UI.
    - Server-side validation: schema, ranges, referential integrity (student exists, subject exists).
    - Partial import: commit valid rows; return per-row error report and downloadable failed-rows CSV.

4. Audit Trail & Versioning
    - Immutable audit table capturing create/update/approve/reject actions with before/after snapshots.

5. Notifications & Distribution
    - Email notifications via SendGrid for verification requests, approvals, and report publication.
    - Email content supports links to secure report view and PDF attachment or S3 presigned link.

6. PDF Generation & Official Export
    - Generate branded, print-ready raport PDF per student; batch generation for class/export.
    - Export CSV of combined data for archival.

7. File Storage & Evidence
    - Evidence files attached to assessment entries stored in S3; preview supported in UI.

Acceptance criteria for each feature should be captured in Jira/stories.

## 4. User Flow

1. Teacher (Guru Mapel) — input & submit
    - Login → Select class/subject → Create assessment entry (scores, comments, optional evidence upload) → Click Submit → system validates entries → creates audit log entry → sends notification to Wali Kelas.

2. Wali Kelas — verify
    - Login → Dashboard shows pending verifications → Inspect per-student entries and evidence → Approve or Request Changes with comment → Approval creates audit log and notifies Super Admin; Request Changes reverts to Guru Mapel with message.

3. Super Admin — publish
    - Login → Review approvals → Publish raport (locks records for period) → System generates PDFs (async job), stores on S3, sends notifications to wali santri email addresses.

4. Role-Switching (instant)
    - From any dashboard: open role-switch dropdown → select alternate role (if user has both roles) → system records audit entry and updates UI permissions on-the-fly without re-login.

5. Import Flow (smart)
    - Admin downloads template for data-type → fills spreadsheet → Uploads file → System shows preview N rows with detected columns → User maps columns to internal fields (drag/drop) → User runs validation → Show row-level errors and warnings → User chooses Partial Import or Abort → On Partial Import, only valid rows are committed; failed rows offered as downloadable CSV + error report.

6. Report Distribution
    - After publish, system emails guardian(s) with link + option to download attached PDF or S3 presigned link. Sent via SendGrid (see Section 5).

## 5. Architecture & Integrations

System Components

- Frontend: Next.js + React + Tailwind (SSG/SSR where appropriate).
- Backend: Node.js + Express + TypeScript + job queue (BullMQ/Redis or platform queue) for long tasks (PDF generation, large imports).
- DB: MySQL / MariaDB (managed).
- File Storage: AWS S3 (or compatible) for PDFs, evidence files, import artifacts.
- Email: SendGrid for notification and report distribution.
- Background worker: hosted alongside backend or as separate dyno/service.
- Libraries: PapaParse (CSV parsing/mapping), PDFKit/jsPDF (PDF generation), multer/S3 SDK for file uploads.

Integration Points & Flows

- File upload: client → signed upload URL (S3 presigned) → direct upload to S3 → backend receives file metadata and kicks validation job.
- Large import: upload CSV → enqueue validation job → job parses with PapaParse, validates, stores result in import_job table with row-level errors → user reviews, triggers commit job.
- PDF generation: enqueue per-student or batch job → PDF generated with PDFKit → upload to S3 → update report record.

Email Service (SendGrid)

- Purpose: notifications and digital report distribution to parents/teachers.
- Endpoint (core example):
    - POST https://api.sendgrid.com/v3/mail/send
- Headers:
    - Authorization: Bearer YOUR_SENDGRID_API_KEY
    - Content-Type: application/json
- Example JSON payload (send verification / publication email):

```json
{
    "personalizations": [
        {
            "to": [{ "email": "wali.santri@example.com" }],
            "subject": "Raport Santri Digital - Verifikasi Diperlukan"
        }
    ],
    "from": { "email": "noreply@eraport-pesantren.com" },
    "content": [
        {
            "type": "text/html",
            "value": "<h1>Raport E-Raport Pesantren</h1><p>Silakan verifikasi nilai tahfiz dan kehadiran santri Anda.</p><a href='https://eraport-pesantren.com/verify/123'>Lihat Raport</a>"
        }
    ]
}
```

- Notes:
    - Use per-email personalizations to attach dynamic links (per-student secure token).
    - Large batch sends should respect SendGrid rate limits; employ retries with exponential backoff.
    - Store send events and message IDs for deliverability tracking and audit.

Other integrations

- S3: store PDFs, evidence, failed-rows CSV; generate presigned GET links for secure temporary downloads.
- Optional later: AWS SES alternative (not required in Phase 1). No other external APIs required.

Security & Secrets

- Store SendGrid API key and S3 credentials in platform secret manager.
- Emails must include secure, short-lived tokens for report access (JWT signed).
- Rate-limit endpoints for email sending and import processing.

## 6. Database Schema

Notes: use InnoDB, foreign keys, soft deletes via deleted_at where needed.

Tables (summary)

- users
  | Column | Type | Notes |
  |---|---:|---|
  | id | BIGINT PK AUTO_INCREMENT | |
  | email | VARCHAR(255) UNIQUE | |
  | password_hash | VARCHAR(255) | |
  | name | VARCHAR(255) | |
  | created_at | DATETIME | |
  | updated_at | DATETIME | |
  | deleted_at | DATETIME NULL | soft delete |

- roles
  | Column | Type |
  |---|---:|
  | id | TINYINT PK |
  | name | VARCHAR(50) |

- user_roles
  | Column | Type | Notes |
  |---|---:|---|
  | id | BIGINT PK | |
  | user_id | BIGINT FK -> users.id | |
  | role_id | TINYINT FK -> roles.id | |
  | created_at | DATETIME | |

- students
  | Column | Type | Notes |
  |---|---:|---|
  | id | BIGINT PK | |
  | nisn | VARCHAR(50) UNIQUE | student identifier |
  | name | VARCHAR(255) | |
  | class_id | BIGINT FK -> classes.id | |
  | guardian_email | VARCHAR(255) | |

- classes
  | Column | Type |
  |---|---:|
  | id | BIGINT PK |
  | name | VARCHAR(100) |

- subjects
  | Column | Type |
  |---|---:|
  | id | BIGINT PK |
  | code | VARCHAR(50) |
  | name | VARCHAR(255) |

- assessments
  | Column | Type | Notes |
  |---|---:|---|
  | id | BIGINT PK | |
  | student_id | BIGINT FK -> students.id | |
  | subject_id | BIGINT FK -> subjects.id NULLABLE | NULL for non-subject items |
  | type | ENUM('academic','tahfiz','sikap','attendance','extracurricular') | |
  | score | DECIMAL(5,2) NULL | |
  | comment | TEXT | |
  | evidence_s3_key | VARCHAR(512) NULL | |
  | status | ENUM('draft','submitted','verified','published','rejected') | |
  | created_by | BIGINT FK -> users.id | |
  | updated_by | BIGINT FK -> users.id | |
  | created_at | DATETIME | |
  | updated_at | DATETIME | |

- approvals (workflow steps)
  | Column | Type |
  |---|---:|
  | id | BIGINT PK |
  | assessment_id | BIGINT FK -> assessments.id |
  | actor_id | BIGINT FK -> users.id |
  | role | VARCHAR(50) | role performing action |
  | action | ENUM('submit','approve','reject','publish') |
  | comment | TEXT |
  | created_at | DATETIME |

- audit_logs
  | Column | Type |
  |---|---:|
  | id | BIGINT PK |
  | entity_type | VARCHAR(100) |
  | entity_id | BIGINT |
  | action | VARCHAR(50) |
  | actor_id | BIGINT FK -> users.id |
  | payload_before | JSON NULL | |
  | payload_after | JSON NULL | |
  | created_at | DATETIME |

- imports
  | Column | Type | Notes |
  |---|---:|---|
  | id | BIGINT PK |
  | created_by | BIGINT FK -> users.id |
  | type | VARCHAR(50) | e.g., students, grades, tahfiz |
  | original_filename | VARCHAR(255) | |
  | s3_key | VARCHAR(512) | raw uploaded file |
  | status | ENUM('uploaded','validating','ready','partial','failed','completed') |
  | total_rows | INT |
  | valid_rows | INT |
  | invalid_rows | INT |
  | result_s3_key | VARCHAR(512) NULL | failed-rows CSV |
  | created_at | DATETIME |
  | updated_at | DATETIME |

- import_rows
  | Column | Type |
  |---|---:|
  | id | BIGINT PK |
  | import_id | BIGINT FK -> imports.id |
  | row_number | INT |
  | raw_data | JSON |
  | errors | JSON NULL |
  | status | ENUM('valid','invalid','skipped') |

- reports
  | Column | Type |
  |---|---:|
  | id | BIGINT PK |
  | student_id | BIGINT FK -> students.id |
  | period | VARCHAR(50) | e.g., 2025-Sem1 |
  | pdf_s3_key | VARCHAR(512) |
  | published_by | BIGINT FK -> users.id |
  | published_at | DATETIME |

Indexes

- Indexes on foreign keys, students.nisn, imports.status, assessments.status, reports(student_id, period).

## 7. Constraints

- Data consistency: imports may create duplicates if source file incorrect — implement uniqueness checks (student nisn) and mapping validation before commit.
- Performance: large imports and batch PDF generations must run as background jobs; synchronous UI must only show status and preview.
- Email deliverability: depends on SendGrid limits/quotas; implement throttling and retry logic.
- Security:
    - Sensitive data (student PII) stored encrypted at rest where required by policy.
    - S3 objects containing PII must default to private with presigned short-lived URLs.
    - Role-switching must be auditable and not create privilege escalation beyond assigned roles.
- Storage quotas: implement per-institution storage quotas and retention policies to avoid uncontrolled S3 costs.
- Regulatory / Privacy: store guardian email consent flag; enforce opt-out for email distribution if required.
- Operational: backups (daily DB snapshot), monitoring of queue health, and alerts on job failures.
- Deployment: use managed DB; ensure migrations are transactional and backward compatible.

---

If you want, I can convert core features into epics + sample user stories with acceptance criteria and API endpoints for the backend (CRUD + import endpoints).

---

## Business Requirements Document (BRD) — Phase 2 (E-Raport Pesantren)

Purpose

- Expand and harden Phase 1 E-Raport Pesantren into a production-ready platform supporting institution-level scaling, advanced import reliability, auditable role delegation, scheduled/batch workflows, analytics, and integrations (SMS, webhook, SSO). Preserve Phase 1 guarantees (PDF export, S3 storage, SendGrid emails, RBAC, import pipeline) and add operational features for multi-class/multi-institution use.

Stakeholders

- Super Admin (institution owner / operator), Admin, Wali Kelas, Guru Mapel, Wali Santri (read-only), IT Ops, Compliance Officer.

Phase 2 Objectives (aligned to PRD)

- Reliability & scale: support 10k students / institution and concurrent background jobs (PDF generation, imports) with SLAs.
- Operational features: scheduled batch PDF exports, retryable background jobs, automated retention/archival, daily DB backups.
- Integrations: SMS gateway (optional), webhooks for partner systems, SSO (SAML/OAuth2) for large institutions.
- Improved import UX: column auto-mapping improvements (fuzzy match, mapping presets), incremental import, dedupe suggestions.
- Analytics & reporting: enrollment/trend dashboards, SLA metrics (time-to-verify), exportable aggregate CSVs.
- Security & compliance: encryption-at-rest via KMS, per-institution data partitioning (soft multi-tenant), enhanced audit retention/archiving controls.
- Developer/Operational tooling: observability (metrics, alerts), feature flags, infra-as-code for deploy pipelines.

Scope (in)

- Everything in Phase 1 plus:
    - Scheduled/batched PDF generation and archival with retention rules.
    - Import presets & fuzzy mapping; preview latency reductions via streaming parsing.
    - Webhook delivery for publish events; per-institution webhook config with retries.
    - SMS sending (via Twilio/alternative) as optional channel.
    - SSO (SAML / OAuth2) for enterprise customers.
    - Read-only API access tokens for third-party MIS integration.
    - Role delegation and temporary role grants with expiry and audit.
    - Advanced audit query API and long-term archival to cold storage.

Out of scope (for Phase 2)

- Native mobile apps (still responsive web).
- Machine-learning scoring / predictive analytics (Phase 3).
- Offline-first mobile data capture.

Success Metrics (Phase 2)

- End-to-end publish pipeline (submit → publish → email + PDF) 99% success under normal load.
- Import preview latency for 100k-row files: streaming preview < 15s.
- PDF batch generation (class of 40) completed within 60s per class (background).
- Audit query responsiveness: 95th percentile < 300ms for last-90-days; archival queries slower but available.
- Email/SMS deliverability logs captured with message IDs for 100% of notifications.

High-level Acceptance Criteria (mapping to PRD)

- Role delegation: UI/Backend enables temporary grants; role-switch audit entries created for each grant/switch (payload: user_id, from_role, to_role, granted_by, expires_at).
- Import pipeline: server-side validation returns per-row error objects; partial import commits valid rows; failed rows downloadable CSV; mapping presets reusable.
- PDF generation: batch/individual PDFs present in S3 with presigned URLs; generation job emits events to audit and webhook.
- Notifications: SendGrid + optional SMS events logged with provider message IDs; retries and backoff for failures.
- Security: TLS, KMS encryption at rest for PII columns, S3 objects default private, short presigned expiry.

## Detailed Tech Stack (Phase 2)

Frontend

- Next.js (React) + TypeScript, TailwindCSS.
- SSR/SSG where beneficial (public pages), client-side rendering for dashboard interactions.
- Libraries: react-query / SWR for data fetching, xlsx and PapaParse client helpers for mapping previews, FilePond for upload UX.

Backend (API & App)

- Node.js + TypeScript + Express (or Fastify as alternative for performance).
- API style: RESTful JSON with consistent error envelope.
- Authentication: JWT (access token short-lived) + session store for server-side session state (Redis) to support role-switching tokens; SSO via SAML / OAuth2 connectors.
- Authorization: RBAC with policy checks, feature flags per-institution.
- Background jobs: BullMQ on Redis (or platform queue) for:
    - CSV/Excel validation and parsing
    - Batch/individual PDF generation (Puppeteer or Chromium headless for HTML -> PDF)
    - Email/SMS delivery coordination and retries
    - Import commit jobs
- Parsing/Validation:
    - Server: papa-parse (node), npm xlsx for Excel support
    - CSV streaming to limit memory for large files
- PDF generation:
    - Puppeteer to render server-side HTML templates (branded, localized) → PDF
    - Optional PDFKit for small one-off templates
- Database:
    - MariaDB / MySQL (InnoDB). Primary instance + read replicas for reporting.
    - TypeORM / Prisma for migrations and typed schema (recommend Prisma for dev DX).
- Cache / short-lived storage:
    - Redis for sessions, queues, caching mapping presets, rate-limit counters.
- Object Storage:
    - AWS S3 (or compatible): raw uploads, PDFs, evidence, failed-rows CSVs, import artifacts.
    - Server generates presigned PUT/GET URLs for direct client uploads.
- Email & SMS:
    - SendGrid for email. Integrate provider SDK; store message IDs and send events.
    - Twilio (optional) for SMS (or pluggable connector).
- Observability:
    - Prometheus + Grafana for metrics; Sentry for error tracing; ELK or Datadog logs.
- Security:
    - Secrets in managed platform (Heroku/Render/Railway secret store, or AWS Secrets Manager).
    - KMS for DB-level column encryption for PII (e.g., guardian_email if required).
    - WAF and TLS termination on load balancer.
- CI/CD:
    - GitHub Actions + Terraform/CloudFormation for infra; deploy to Render/Heroku/Railway.
- Other tools:
    - Virus scanning on uploads (ClamAV) in the upload pipeline.
    - Rate limiting (API gateway), per-tenant quotas.

Scalability & Ops

- Autoscaling backend workers and web; separate worker pool for heavy PDF generation and import validation.
- S3 lifecycle rules: move PDFs > retention to glacier/cold storage based on institutional policy.
- Daily DB backups + PITR where available.
- On-call rotations + alerting for job failures and queue backlogs.

## API Documentation — Internal Backend Endpoints (Phase 2)

Notes:

- All endpoints require Authorization: Bearer <access_token> header unless public.
- Role checks shown as (roles allowed).
- Error envelope: { "error": { "code": "string", "message": "string", "details": any } }
- Timestamps i
