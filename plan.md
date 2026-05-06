# Plan Bertahap — E-Taqrir (E-Raport Pesantren)

Stack: **Laravel 11 + React + Inertia.js + TypeScript + TailwindCSS + MySQL/MariaDB + S3**.

Stack adaptasi dari PRD (PRD asli: Next.js + Node/Express). Mapping:
- Next.js → **Laravel + Inertia + React** (SSR-friendly, satu repo).
- Express + BullMQ → **Laravel Queue (database driver)** — tanpa Redis.
- Prisma → **Eloquent ORM + Migrations**.
- Puppeteer PDF → **Spatie Browsershot** (HTML→PDF via Chromium, hasil terbaik untuk layout rapor).
- JWT + session → **Laravel Sanctum** (SPA auth) + session store **database/file**.
- RBAC → **spatie/laravel-permission**.
- PapaParse server → **Maatwebsite/Excel** (Laravel Excel) + chunked reader.
- SendGrid → **Laravel Mail** (Symfony Mailer + SendGrid transport).
- **Tanpa Redis, tanpa Docker.**

---

## Tahap 0 — Setup Awal (Minggu 1)

Tujuan: skeleton siap, CI hijau.

- [ ] Init Laravel 11 + Breeze (Inertia + React + TS).
- [ ] Setup **Tailwind**, Vite, ESLint, Prettier, Larastan, Pint.
- [ ] Config `.env`: MySQL lokal (XAMPP/Laragon), queue driver `database`, session driver `database`, cache driver `database`, S3/MinIO biner, SendGrid sandbox, Mailpit biner.
- [ ] `php artisan queue:table` + `php artisan session:table` + migrate.
- [ ] GitHub Actions: lint, phpstan, pest, build vite.
- [ ] Folder structure: `app/Domain/{Assessment,Import,Report,Audit}` (DDD-lite).
- [ ] Sanctum SPA auth, CSRF, rate limit middleware.

Deliverable: login Breeze jalan, CI hijau. Tanpa Redis, tanpa Docker.

---

## Tahap 1 — Auth, RBAC, Role-Switching (Minggu 2)

Tujuan: user + role multi-grant + switch tanpa logout.

- [ ] Migrasi `users`, `roles`, `user_roles` (pakai tabel Spatie Permission).
- [ ] Seed roles: `super_admin`, `wali_kelas`, `guru_mapel`, `wali_santri`.
- [ ] Install `spatie/laravel-permission`.
- [ ] Endpoint `POST /role/switch` → simpan `active_role` di session DB, tulis audit.
- [ ] React `<RoleSwitcher>` di topbar. Hook `useActiveRole()`.
- [ ] Middleware `EnsureActiveRole` — cek user memang punya role itu, block eskalasi.
- [ ] Audit log table + model observer global.

Deliverable: switch role instan, audit tercatat.

---

## Tahap 2 — Master Data (Minggu 3)

Tujuan: CRUD entitas inti.

- [ ] Migrasi `students`, `classes`, `subjects`.
- [ ] Eloquent models + Factory + Seeder demo (50 santri).
- [ ] Inertia pages: list/create/edit/delete dengan TanStack Table.
- [ ] Form validation: FormRequest + Zod sisi React.
- [ ] Soft delete + restore UI untuk super admin.

Deliverable: super admin kelola santri/kelas/mapel.

---

## Tahap 3 — Assessment Workflow (Minggu 4-5)

Tujuan: input nilai → submit → verifikasi → publish.

- [ ] Migrasi `assessments`, `approvals`.
- [ ] State machine: `spatie/laravel-model-states` (draft→submitted→verified→published + rejected).
- [ ] Policy per state + per role.
- [ ] Endpoint: store, submit, approve, reject, publish.
- [ ] UI Guru Mapel: grid input nilai per kelas/mapel, comment, file evidence.
- [ ] UI Wali Kelas: antrian verifikasi, diff viewer, approve/reject + comment.
- [ ] UI Super Admin: antrian publish, lock period.
- [ ] Versioning via audit `payload_before`/`payload_after`.

Deliverable: full workflow end-to-end, audit lengkap.

---

## Tahap 4 — File Upload & Evidence (Minggu 6)

Tujuan: upload aman ke S3.

- [ ] S3 disk config + presigned PUT URL.
- [ ] Endpoint `POST /uploads/presign` → return signed URL.
- [ ] Client direct upload (FilePond).
- [ ] Validasi MIME + size server-side setelah upload (HEAD object S3).
- [ ] Presigned GET untuk preview, expiry 5 menit.

Deliverable: evidence terlampir di assessment, preview aman.

---

## Tahap 5 — Smart Import Pipeline (Minggu 7-8)

Tujuan: import CSV/XLSX dengan mapping + partial import.

- [ ] Migrasi `imports`, `import_rows`.
- [ ] Template generator (`GET /imports/templates/{type}`) → XLSX.
- [ ] Upload → dispatch `ParseImportJob` (chunked Laravel Excel, 500 baris/chunk).
- [ ] Auto-detect kolom + fuzzy match (Levenshtein) → simpan mapping suggestion.
- [ ] UI mapping drag-drop kolom → field internal.
- [ ] `ValidateImportJob`: schema, range, FK check (student exists, dll).
- [ ] Per-row error JSON di `import_rows`.
- [ ] User pilih: Partial Import / Abort.
- [ ] `CommitImportJob`: insert valid rows transaksional batch 500.
- [ ] Failed rows export CSV ke S3, tombol download.
- [ ] Monitor queue: Laravel Telescope (dev) + polling status endpoint (prod).

Deliverable: import 1000 baris < 10s preview, partial commit jalan.

---

## Tahap 6 — PDF Generation & Distribusi (Minggu 9)

Tujuan: PDF rapor + email ke wali santri.

- [ ] Migrasi `reports`.
- [ ] Template Blade rapor (header pesantren, nilai, tahfiz, kehadiran, ttd).
- [ ] Install `spatie/browsershot` + pastikan Chromium tersedia di server.
- [ ] `GenerateReportPdfJob` (Browsershot → S3) — satu job per santri.
- [ ] Batch dispatch per kelas setelah publish.
- [ ] SendGrid mailer config + Mailable `ReportPublished` (presigned link, token signed short-lived).
- [ ] Tracking `message_id` di tabel `email_events`.
- [ ] Retry 3x + backoff via queue `tries` + `backoff`.
- [ ] Halaman wali santri: token-based view, download PDF.

Deliverable: publish 1 kelas → 40 PDF + 40 email terkirim.

---

## Tahap 7 — Notifikasi In-App + Polish (Minggu 10)

- [ ] Database notifications (`php artisan notifications:table`) — polling ringan tanpa websocket.
- [ ] Bell icon + dropdown unread count (polling 30s atau SWR).
- [ ] Email digest harian opsional.
- [ ] i18n ID (laravel-lang + react-i18next).
- [ ] Responsive, empty states, skeleton loaders, toast konsisten.

---

## Tahap 8 — Hardening & Launch (Minggu 11-12)

- [ ] RBAC test matrix (Pest).
- [ ] Feature test workflow end-to-end.
- [ ] Load test import 10k row + PDF batch (k6).
- [ ] Security review: CSP, XSS, file upload, presigned expiry, rate limit.
- [ ] Backup harian DB (mysqldump → S3) + retensi 30 hari.
- [ ] Observability: Sentry, Telescope (staging).
- [ ] Dokumentasi: README, runbook, API docs (Scribe).
- [ ] Deploy: Forge/Ploi/Render. DB managed. Queue worker (`php artisan queue:work`) sebagai process terpisah.

Deliverable: MVP production-ready.

---

## Phase 2 (Pasca-MVP)

- Upgrade queue driver ke Redis (jika volume tumbuh).
- Multi-tenant per institusi (`institution_id` global scope).
- SSO SAML/OAuth2.
- Webhook outbound (publish event).
- SMS via Twilio.
- Role delegation temporer.
- Mapping presets import.
- Read-only API token (Sanctum personal token).
- Analytics dashboard (time-to-verify, SLA).

---

## Tabel Risiko Cepat

| Risiko | Mitigasi |
|---|---|
| Queue DB lambat saat volume besar | Upgrade ke Redis di Phase 2. Untuk MVP cukup. |
| PDF lambat saat publish massal | Batch kecil (satu job/santri), Browsershot timeout 60s. |
| Import file besar OOM | Chunk 500 baris Laravel Excel, streaming. |
| Role-switch privilege escalation | Middleware cek `user->hasRole(active_role)` tiap request + audit. |
| SendGrid rate limit | Queue throttle, retry 3x backoff. |

---

**Stack final terkonfirmasi: Laravel 11 + Inertia + React + TS + Tailwind + MySQL + Spatie Permission + Spatie Browsershot + Laravel Queue (database) + S3. Mulai Tahap 0.**
