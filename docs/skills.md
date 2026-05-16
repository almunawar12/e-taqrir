# E-Taqrir Project Skills Reference

Domain knowledge and implementation patterns specific to this codebase.

---

## Domain Language (Bahasa Indonesia)

| Term        | Meaning                         |
| ----------- | ------------------------------- |
| Taqrir      | Report card / academic report   |
| Santri      | Student (pesantren context)     |
| Wali Santri | Parent/guardian of a santri     |
| Wali Kelas  | Homeroom teacher                |
| Guru Mapel  | Subject teacher                 |
| Mapel       | Subject (mata pelajaran)        |
| Tahfiz      | Quranic memorization assessment |
| Pesantren   | Islamic boarding school         |
| NIS         | Nomor Induk Siswa (Student ID)  |
| SKS         | Jam/credit hours per subject    |

---

## Folder Structure

```
e-taqrir/
├── app/
│   ├── Domain/
│   │   ├── Assessment/         # State machine, transitions
│   │   │   └── States/         # Draft, Submitted, Verified, Published, Rejected
│   │   ├── Audit/              # Immutable audit trail logic
│   │   ├── Import/             # CSV/XLSX chunked import pipeline
│   │   └── Report/             # PDF generation + distribution
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/           # Laravel Breeze auth controllers
│   │   │   ├── AssessmentController.php
│   │   │   ├── ClassroomController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── EvidenceController.php
│   │   │   ├── ProfileController.php
│   │   │   ├── RoleSwitchController.php
│   │   │   ├── StudentController.php
│   │   │   └── SubjectController.php
│   │   ├── Middleware/
│   │   │   └── EnsureActiveRole.php
│   │   └── Requests/           # FormRequest validation classes
│   ├── Jobs/                   # Queued jobs (PDF, import)
│   ├── Models/
│   │   ├── Assessment.php
│   │   ├── AssessmentItem.php
│   │   ├── Approval.php
│   │   ├── AuditLog.php
│   │   ├── Classroom.php
│   │   ├── Student.php
│   │   ├── Subject.php
│   │   └── User.php
│   ├── Policies/               # Gate/Policy classes per model
│   └── Providers/
│
├── database/
│   ├── factories/
│   └── migrations/
│
├── docs/
│   └── skills.md               # ← this file
│
├── resources/
│   ├── css/
│   ├── js/
│   │   ├── Components/
│   │   │   ├── ConfirmModal.tsx
│   │   │   ├── CrudModal.tsx       # CRUD modal wrapper (headlessui)
│   │   │   ├── DataTable.tsx       # TanStack Table wrapper
│   │   │   ├── FormField.tsx       # Label + input + error + hint
│   │   │   ├── Modal.tsx           # Generic headlessui modal
│   │   │   ├── PageHero.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── RoleSwitcher.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── Toast.tsx           # react-hot-toast + Inertia flash bridge
│   │   │   └── Topbar.tsx
│   │   ├── Layouts/
│   │   │   └── AuthenticatedLayout.tsx
│   │   ├── Pages/
│   │   │   ├── Assessments/
│   │   │   │   ├── Create.tsx
│   │   │   │   ├── Edit.tsx
│   │   │   │   ├── Index.tsx
│   │   │   │   └── Show.tsx
│   │   │   ├── Auth/               # Login, Register, ForgotPassword, etc.
│   │   │   ├── Classrooms/
│   │   │   │   └── Index.tsx       # Modal-based CRUD
│   │   │   ├── Profile/
│   │   │   ├── Students/
│   │   │   │   └── Index.tsx       # Modal-based CRUD
│   │   │   ├── Subjects/
│   │   │   │   └── Index.tsx       # Modal-based CRUD
│   │   │   ├── Dashboard.tsx
│   │   │   └── Welcome.tsx
│   │   ├── hooks/
│   │   │   ├── useActiveRole.ts
│   │   │   └── useConfirm.tsx
│   │   ├── types/
│   │   ├── app.tsx
│   │   └── bootstrap.ts
│   └── views/
│       └── reports/                # Blade views for PDF generation
│
├── routes/
│   ├── auth.php
│   ├── console.php
│   └── web.php
│
└── tests/
    ├── Feature/
    └── Unit/
```

---

## ERD (Entity Relationship Diagram)

```
┌─────────────────────────────────────────────────────────────┐
│                          USERS                               │
│  id · name · email · password · active_role                  │
│  (Spatie: roles via model_has_roles)                         │
└──────┬──────────────────────┬───────────────────────────────┘
       │ homeroom_teacher_id  │ teacher_id
       ▼                      ▼
┌─────────────────┐    ┌──────────────────────────────────────┐
│   CLASSROOMS    │    │            ASSESSMENTS                │
│  id             │    │  id                                   │
│  name           │    │  classroom_id ──────────────────┐    │
│  grade_level    │◄───│  subject_id ──────────┐         │    │
│  academic_year  │    │  teacher_id            │         │    │
│  homeroom_      │    │  academic_year         │         │    │
│   teacher_id    │    │  semester              │         │    │
│  deleted_at     │    │  state (draft→published)│        │    │
└────────┬────────┘    │  comment               │         │    │
         │             │  submitted/verified/   │         │    │
         │             │   published_at         │         │    │
         │ classroom_id│  evidence_path/disk    │         │    │
         ▼             └────────────┬───────────┘         │    │
┌─────────────────┐                │                      │    │
│    STUDENTS     │                │ assessment_id         │    │
│  id             │                ▼                      │    │
│  nis (unique)   │   ┌─────────────────────────┐        │    │
│  name           │   │    ASSESSMENT_ITEMS      │        │    │
│  gender (L/P)   │◄──│  id                      │        │    │
│  birth_date     │   │  assessment_id           │        │    │
│  birth_place    │   │  student_id ─────────────┘        │    │
│  address        │   │  score (decimal 5,2)              │    │
│  wali_phone     │   │  notes                            │    │
│  classroom_id   │   └──────────────────────────────────┘    │
│  deleted_at     │                                            │
└─────────────────┘   ┌───────────────────────────┐           │
                       │       APPROVALS            │           │
┌─────────────────┐   │  id                        │           │
│    SUBJECTS     │   │  assessment_id ────────────┘           │
│  id             │   │  user_id ──► USERS                     │
│  code (unique)  │◄──│  from_state                            │
│  name           │   │  to_state                              │
│  category       │   │  comment                               │
│  credit_hours   │   └───────────────────────────────────────┘
│  deleted_at     │
└─────────────────┘   ┌───────────────────────────┐
                       │       AUDIT_LOGS           │
                       │  id                        │
                       │  user_id ──► USERS         │
                       │  active_role               │
                       │  event                     │
                       │  auditable_type (morph)    │
                       │  auditable_id              │
                       │  payload_before (json)     │
                       │  payload_after (json)      │
                       │  ip · user_agent           │
                       └───────────────────────────┘
```

### Table Columns Reference

**users**
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| name | string | |
| email | string unique | |
| password | string hashed | |
| active_role | string nullable | indexed; tracked in audit |
| email_verified_at | timestamp nullable | |

**classrooms**
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| name | string | unique with academic_year |
| grade_level | string(20) | VII, VIII, IX |
| academic_year | string(20) | format YYYY/YYYY |
| homeroom_teacher_id | FK → users nullable | |
| deleted_at | timestamp nullable | soft delete |

**students**
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| nis | string(20) unique | |
| name | string | indexed |
| gender | enum('L','P') | |
| birth_date | date nullable | |
| birth_place | string(100) nullable | |
| address | text nullable | |
| wali_phone | string(20) nullable | |
| classroom_id | FK → classrooms nullable | indexed |
| deleted_at | timestamp nullable | soft delete |

**subjects**
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| code | string(20) unique | e.g. MAT-101 |
| name | string | |
| category | string(50) nullable | |
| credit_hours | tinyint unsigned | default 2, range 1-8 |
| deleted_at | timestamp nullable | soft delete |

**assessments**
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| classroom_id | FK → classrooms cascade | |
| subject_id | FK → subjects cascade | |
| teacher_id | FK → users cascade | |
| academic_year | string(20) | |
| semester | tinyint unsigned | 1 or 2 |
| state | string(30) | default 'draft' |
| comment | text nullable | rejection reason |
| submitted_at | timestamp nullable | |
| verified_at | timestamp nullable | |
| published_at | timestamp nullable | |
| evidence_path | string nullable | S3/local path |
| evidence_disk | string | default 'evidence' |
| evidence_name | string nullable | original filename |
| **unique** | [classroom_id, subject_id, academic_year, semester] | |

**assessment_items**
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| assessment_id | FK → assessments cascade | |
| student_id | FK → students cascade | |
| score | decimal(5,2) nullable | |
| notes | text nullable | |
| **unique** | [assessment_id, student_id] | |

**approvals**
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| assessment_id | FK → assessments cascade | indexed with created_at |
| user_id | FK → users cascade | |
| from_state | string(30) | |
| to_state | string(30) | |
| comment | text nullable | |

**audit_logs**
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| user_id | FK → users nullable | |
| active_role | string nullable | role at time of event |
| event | string(64) | indexed |
| auditable_type | string nullable | polymorphic |
| auditable_id | bigint unsigned nullable | polymorphic |
| payload_before | json nullable | |
| payload_after | json nullable | |
| ip | string(45) nullable | |
| user_agent | string nullable | |

---

## Assessment Lifecycle

States managed by `spatie/laravel-model-states` in `app/Domain/Assessment/States/`:

```
draft → submitted → verified → published
                 ↘ rejected → (returns to draft)
```

When adding new state transitions:

1. Define state class in `app/Domain/Assessment/States/`
2. Register transition in the `Assessment` model `registerStates()` method
3. Guard transitions with Policies, not inline checks

Model helpers: `isDraft()`, `isSubmitted()`, `isVerified()`, `isPublished()`, `isRejected()`

---

## RBAC (Roles & Permissions)

Spatie Permission — 4 roles:

| Role | Can do |
|------|--------|
| `super_admin` | Full access, publish reports |
| `wali_kelas` | Verify assessments for own classroom |
| `guru_mapel` | Create/submit assessments for own subjects |
| `wali_santri` | Read-only: child's published reports |

Check roles in PHP:
```php
$user->hasRole('wali_kelas')
$user->can('verify-assessment')

// Query users by role — pass array, NOT chained orRole():
User::role(['wali_kelas', 'super_admin'])->get();
```

Frontend role check — always use hook, not raw `usePage().props.auth`:
```tsx
const { active } = useActiveRole();
if (active === 'super_admin') { ... }
```

Role-switching triggers audit log entry automatically via `EnsureActiveRole` middleware.

---

## Inertia.js Patterns

Pages receive typed props from controllers:

```tsx
interface Props extends PageProps {
    assessments: Paginated<Assessment>;
    filters: { search?: string };
}
export default function Index() {
    const { assessments, filters } = usePage<Props>().props;
}
```

- Use `router.get()` for filter/pagination (preserve state)
- Use `useForm()` + `post()`/`put()` for form submissions
- Never use raw `fetch`/`axios` for Inertia routes
- For non-Inertia endpoints (evidence upload, PDF): use `axios` from `bootstrap.ts` (CSRF pre-configured)

### Modal CRUD Pattern

Classrooms, Students, Subjects use inline modals (no separate Form pages):

```tsx
const [modalOpen, setModalOpen] = useState(false);
const [editItem, setEditItem] = useState<Item | undefined>(undefined);

// key forces useForm remount when switching create ↔ edit
<CrudModal show={modalOpen} title="..." onClose={() => setModalOpen(false)}>
    <ItemForm
        key={editItem?.id ?? 'create'}
        item={editItem}
        onClose={() => setModalOpen(false)}
    />
</CrudModal>
```

Form submission closes modal via `onSuccess` callback; flash message fires toast automatically:
```tsx
put(`/classrooms/${id}`, { onSuccess: onClose });
```

---

## Form Validation Pattern

Two-layer validation:

1. **Frontend:** Zod schema in component, validated on `submit`
2. **Backend:** Laravel `FormRequest` in `app/Http/Requests/`

```tsx
const schema = z.object({ name: z.string().min(1) });

const submit = (e: FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(data);
    if (!result.success) { /* set zodErrors */ return; }
    post('/classrooms', { onSuccess: onClose });
};

const err = (field: string) => zodErrors[field] ?? errors[field];
```

`FormField.tsx` components: `TextField`, `SelectField`, `TextArea` — all accept standard HTML attributes + the `inputBase` class.

---

## Toast Notifications

`react-hot-toast` wired in `Components/Toast.tsx` — mounted once in `AuthenticatedLayout`:

- **Auto:** Controller `->with('success', ...)` / `->with('error', ...)` → flash → toast
- **Manual:** import `toast` and call directly for client-side events (e.g. delete callbacks)

```tsx
import { toast } from '@/Components/Toast';

router.delete(`/students/${id}`, {
    onSuccess: () => toast.success('Data santri berhasil dihapus.'),
    onFinish: done,
});
```

---

## Controllers Reference

| Controller | Routes (no create/edit for master data) |
|------------|----------------------------------------|
| `DashboardController` | `GET /dashboard` (invokable) |
| `ClassroomController` | index, store, update, destroy, restore |
| `StudentController` | index, store, update, destroy, restore |
| `SubjectController` | index, store, update, destroy, restore |
| `AssessmentController` | index, create, store, edit, update, show, destroy, transition |
| `EvidenceController` | store, destroy, show |
| `RoleSwitchController` | `POST /role/switch` (invokable) |
| `ProfileController` | edit, update, destroy |

Master data (Classrooms/Students/Subjects) excludes `create` and `edit` routes — forms are in modals on Index page.

---

## Import Pipeline

CSV/XLSX imports go through `app/Domain/Import/`:

- Chunked processing via `maatwebsite/excel`
- Partial commit: valid rows import even if some fail
- Import artifacts stored on S3
- Queued jobs — check `queue:listen` is running during dev

---

## PDF Generation

Browsershot (Chromium) generates PDFs from Blade views in `resources/views/reports/`.

- Always queue PDF jobs — never generate synchronously in request cycle
- PDF files stored on S3 with presigned URL distribution to Wali Santri

---

## Testing Conventions

Pest 3 with SQLite in-memory (see `phpunit.xml`).

```bash
composer test                        # Full suite
php artisan test --filter=TestName   # Single test
```

- Feature tests for HTTP endpoints
- Unit tests for domain logic in `app/Domain/`
- Use `RefreshDatabase` trait in feature tests
- Factories for all models — don't build raw arrays in tests

---

## Frontend Component Conventions

| Component | Usage |
|-----------|-------|
| `CrudModal.tsx` | Wrapper for CRUD modals — accepts `show`, `title`, `onClose`, `maxWidth` |
| `DataTable.tsx` | TanStack Table wrapper; pass `columns` and `data` |
| `FormField.tsx` | Label + input + error + hint; exports `TextField`, `SelectField`, `TextArea` |
| `ConfirmModal.tsx` / `useConfirm` | Imperative confirm dialog |
| `Toast.tsx` | Toaster + flash bridge; re-exports `toast` for direct use |
| `StatCard.tsx` | Dashboard stat card with `tone`, `badge`, `inverse` props |
| `PageHero.tsx` | Page header with icon, title, subtitle |
| `Pagination.tsx` | Pagination bar; accepts `meta` (paginator shape) + `onPage` callback |

Tailwind uses Material 3 color tokens from `tailwind.config.js`:

- Primary: `primary-*` (green scale, base `#004532`)
- Always use design tokens, not raw hex values

---

## Queue / Async Jobs

Queue connection is `database` (no Redis). During development:

- `composer dev` starts `queue:listen` automatically
- If running `php artisan serve` manually, also run `php artisan queue:listen` separately

Jobs live in `app/Jobs/`. Use `dispatch()` helper, not `Queue::push()`.

---

## Key Dev Commands

```bash
composer dev       # Concurrent: Laravel serve + queue + pail logs + Vite
composer setup     # First-time: install, .env, key, migrate, npm build
composer test      # Clear config + run Pest

npm run type-check # TypeScript (no emit)
npm run lint       # ESLint strict (0 warnings)
npm run build      # Production bundle

./vendor/bin/pint           # PHP code style
./vendor/bin/phpstan analyse # Static analysis
```
