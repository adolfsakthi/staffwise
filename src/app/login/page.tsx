'use client';
import { Icons } from "@/components/icons";
import LoginForm from "@/components/auth/login-form";
import Image from "next/image";

export default function LoginPage() {
    return (
      <div className="grid min-h-screen w-full lg:grid-cols-2">
        <div className="relative hidden bg-gray-100 lg:block">
            <Image
                src="https://picsum.photos/seed/3/1200/1600"
                alt="A modern building at night"
                data-ai-hint="building night"
                fill
                priority
                className="object-cover"
            />
            <div className="relative z-10 flex h-full flex-col justify-end bg-black/40 p-10 text-white">
                <div className="mb-4 flex items-center gap-3">
                    <Icons.logo className="size-10" />
                    <h1 className="text-3xl font-bold">StaffWise</h1>
                </div>
                <p className="max-w-lg text-lg">
                    Manage your workforce efficiently and gain insights into attendance patterns with our comprehensive tracking system.
                </p>
            </div>
        </div>
        <div className="flex items-center justify-center bg-background p-6">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-left">
                    <div className="mb-2 flex items-center gap-2">
                        <Icons.logo className="size-8 text-primary" />
                         <h2 className="text-2xl font-bold text-primary">StaffWise</h2>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Login to your account
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Welcome back! Please enter your details.
                    </p>
                </div>
                <LoginForm />
            </div>
        </div>
      </div>
    )
}
