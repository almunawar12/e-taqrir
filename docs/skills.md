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

---

## Assessment Lifecycle

States managed by `spatie/laravel-model-states`:

```
draft → submitted → verified → published
                 ↘ rejected (returns to draft)
```

When adding new state transitions:

1. Define state class in `app/Domain/Assessment/States/`
2. Register transition in the `Assessment` model `registerStates()` method
3. Guard transitions with Policies, not inline checks

---

## RBAC Implementation

Spatie Permission — roles checked via:

```php
$user->hasRole('wali_kelas')
$user->can('verify-assessment')
```

Frontend role check via `useActiveRole` hook — always use this, not raw `usePage().props.auth`:

```tsx
const { activeRole } = useActiveRole();
```

Role-switching triggers an audit log entry automatically via middleware.

---

## Inertia.js Patterns

Pages receive typed props from controllers:

```tsx
// In Page component
interface Props {
    assessments: Assessment[];
    filters: FilterState;
}
export default function Index({ assessments, filters }: Props) {}
```

Use `router.visit()` for navigation, `useForm()` for form submissions — never raw `fetch`/`axios` for Inertia routes.

For non-Inertia API endpoints (import, PDF), use `axios` from `bootstrap.ts` (CSRF configured).

---

## Form Validation Pattern

Two-layer validation:

1. **Frontend:** Zod schema in component, validated on submit
2. **Backend:** Laravel `FormRequest` class in `app/Http/Requests/`

`FormField.tsx` component accepts Inertia's `errors` prop automatically — always pass errors down to it.

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

Feature tests for HTTP endpoints; unit tests for domain logic in `app/Domain/`.
Use `RefreshDatabase` trait in feature tests.
Factories for all models — don't build raw arrays in tests.

---

## Frontend Component Conventions

- `DataTable.tsx` — wraps TanStack Table; pass `columns` and `data` props
- `FormField.tsx` — wraps input with label + Inertia error display
- `useConfirm.tsx` — imperative confirm dialog (returns Promise)
- Toast notifications via `react-hot-toast` — import from `Components/Toast`

Tailwind classes use the Material 3 color tokens defined in `tailwind.config.js`:

- Primary: `primary-*` (green scale, base `#004532`)
- Use design tokens, not raw hex values

---

## Queue / Async Jobs

Queue connection is `database` (no Redis). During development:

- `composer dev` starts `queue:listen` automatically
- If running `php artisan serve` manually, also run `php artisan queue:listen` separately

Jobs live in `app/Jobs/`. Use `dispatch()` helper, not `Queue::push()`.
