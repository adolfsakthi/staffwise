'use client';
import { Icons } from "@/components/icons";
import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <div className="mb-8 flex flex-col items-center">
                    <Icons.logo className="size-12 text-primary" />
                    <h1 className="mt-4 text-3xl font-bold tracking-tight">StaffWise</h1>
                    <p className="text-muted-foreground">Welcome back! Please sign in to continue.</p>
                </div>
                <LoginForm />
            </div>
        </div>
    );
}
