import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

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

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {/* Form header */}
            <div className="space-y-xs mb-lg">
                <h1 className="text-h2 font-h2 text-on-surface">Welcome back</h1>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                    Please enter your details to access your account.
                </p>
            </div>

            {status && (
                <div className="mb-md text-body-sm font-body-sm text-primary">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-md">
                {/* Email */}
                <div className="space-y-xs">
                    <label
                        htmlFor="email"
                        className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider"
                    >
                        Username or Email
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-[20px]">
                            person
                        </span>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            autoComplete="username"
                            autoFocus
                            placeholder="Enter your username"
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full rounded-lg border border-outline-variant bg-surface py-md pl-xl pr-md text-body-md font-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1" />
                </div>

                {/* Password */}
                <div className="space-y-xs">
                    <div className="flex items-center justify-between">
                        <label
                            htmlFor="password"
                            className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider"
                        >
                            Password
                        </label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-body-sm font-body-sm text-primary hover:underline transition-all"
                            >
                                Forgot Password?
                            </Link>
                        )}
                    </div>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-[20px]">
                            lock
                        </span>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            autoComplete="current-password"
                            placeholder="••••••••"
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full rounded-lg border border-outline-variant bg-surface py-md pl-xl pr-md text-body-md font-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <InputError message={errors.password} className="mt-1" />
                </div>

                {/* Remember me */}
                <label className="flex cursor-pointer items-center gap-sm">
                    <Checkbox
                        name="remember"
                        checked={data.remember}
                        onChange={(e) =>
                            setData('remember', (e.target.checked || false) as false)
                        }
                        className="text-primary focus:ring-primary"
                    />
                    <span className="text-body-sm font-body-sm text-on-surface">
                        Remember me for 30 days
                    </span>
                </label>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={processing}
                    className="flex w-full items-center justify-center gap-sm rounded-lg bg-primary-container py-md text-button font-button text-on-primary-container shadow-sm transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
                >
                    <span>Sign In</span>
                    <span className="material-symbols-outlined text-[16px]">login</span>
                </button>
            </form>

            {/* Footer */}
            <div className="mt-lg border-t border-outline-variant pt-md text-center">
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                    Don&apos;t have an account yet?{' '}
                    <a href="#" className="font-semibold text-primary hover:underline">
                        Contact Administrator
                    </a>
                </p>
            </div>
        </GuestLayout>
    );
}
