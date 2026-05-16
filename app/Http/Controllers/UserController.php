<?php
namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $users = User::query()
            ->with('roles:id,name')
            ->when(
                $request->search,
                fn ($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%")
            )
            ->when(
                $request->role,
                fn ($q, $r) => $q->whereHas('roles', fn ($q) => $q->where('name', $r))
            )
            ->orderBy('name')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Users/Index', [
            'users'   => $users,
            'roles'   => Role::orderBy('name')->pluck('name'),
            'filters' => $request->only('search', 'role'),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $user = User::create([
            'name'        => $request->name,
            'email'       => $request->email,
            'password'    => $request->password,
            'active_role' => $request->role,
        ]);
        $user->syncRoles([$request->role]);

        return back()->with('success', 'Pengguna berhasil ditambahkan.');
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        $data = [
            'name'        => $request->name,
            'email'       => $request->email,
            'active_role' => $request->role,
        ];
        if (filled($request->password)) {
            $data['password'] = $request->password;
        }

        $user->update($data);
        $user->syncRoles([$request->role]);

        return back()->with('success', 'Data pengguna berhasil diperbarui.');
    }

    public function destroy(User $user): RedirectResponse
    {
        $this->authorize('delete', $user);
        $user->delete();

        return back()->with('success', 'Pengguna berhasil dihapus.');
    }
}
