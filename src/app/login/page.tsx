'use client';
import { Icons } from "@/components/icons";
import LoginForm from "@/components/auth/login-form";
import Image from "next/image";

export default function LoginPage() {
    return (
      <div className="flex min-h-screen items-stretch bg-background text-foreground">
        <div className="relative hidden w-1/2 flex-col justify-end p-12 lg:flex">
          <Image
            src="https://picsum.photos/seed/building-night/1200/1800"
            alt="Building at night"
            fill
            className="object-cover"
            data-ai-hint="building night"
            priority
          />
        </div>
        <div className="flex w-full items-center justify-center bg-accent p-8 lg:w-1/2">
            <div className="w-full max-w-sm">
                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="flex items-center gap-4">
                        <Icons.hezeeLogo className="size-16 text-primary" />
                        <h1 className="text-5xl font-bold tracking-wider text-primary">HEZEE</h1>
                    </div>
                    <p className="mt-4 text-sm text-foreground/80">
                        For the purpose of industry regulation, your details are required.
                    </p>
                </div>
                <LoginForm />
            </div>
        </div>
      </div>
    );
}
