import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-on-surface tracking-tight">Selamat Datang</h1>
                <p className="mt-1 text-sm text-on-surface-variant">
                    Masukkan kredensial Anda untuk mengakses akun.
                </p>
            </div>

            {status && (
                <div className="mb-4 rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                {/* Email */}
                <div>
                    <label
                        htmlFor="email"
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-on-surface-variant"
                    >
                        Username atau Email
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 select-none text-[20px] text-outline">
                            person
                        </span>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            autoComplete="username"
                            autoFocus
                            placeholder="Masukkan username Anda"
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full rounded-xl border border-outline-variant bg-surface-container-low py-3 pl-11 pr-4 text-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/40 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1.5 text-xs" />
                </div>

                {/* Password */}
                <div>
                    <div className="mb-1.5 flex items-center justify-between">
                        <label
                            htmlFor="password"
                            className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant"
                        >
                            Password
                        </label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs font-medium text-primary transition-all hover:underline"
                            >
                                Lupa Password?
                            </Link>
                        )}
                    </div>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 select-none text-[20px] text-outline">
                            lock
                        </span>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full rounded-xl border border-outline-variant bg-surface-container-low py-3 pl-11 pr-12 text-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/40 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-on-surface focus:outline-none"
                            aria-label="Toggle password visibility"
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                {showPassword ? 'visibility' : 'visibility_off'}
                            </span>
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-1.5 text-xs" />
                </div>

                {/* Remember me */}
                <label className="flex cursor-pointer items-center gap-2.5">
                    <Checkbox
                        name="remember"
                        checked={data.remember}
                        onChange={(e) => setData('remember', (e.target.checked || false) as false)}
                        className="h-4 w-4 accent-primary"
                    />
                    <span className="text-sm text-on-surface">Ingat saya selama 30 hari</span>
                </label>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={processing}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-on-primary-fixed-variant active:scale-[0.98] disabled:opacity-60"
                >
                    {processing ? (
                        <span className="material-symbols-outlined animate-spin text-[18px]">
                            progress_activity
                        </span>
                    ) : (
                        <>
                            <span>Masuk</span>
                            <span className="material-symbols-outlined text-[18px]">login</span>
                        </>
                    )}
                </button>
            </form>

            {/* Contact admin */}
            <div className="mt-6 border-t border-outline-variant pt-5 text-center">
                <p className="text-sm text-on-surface-variant">
                    Belum punya akun?{' '}
                    <a href="#" className="font-semibold text-primary hover:underline">
                        Hubungi Administrator
                    </a>
                </p>
            </div>
        </GuestLayout>
    );
}
