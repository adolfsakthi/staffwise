'use client';
import { Icons } from "@/components/icons";
import LoginForm from "@/components/auth/login-form";
import Image from "next/image";

export default function LoginPage() {
    return (
      <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
        <div className="hidden bg-muted lg:block">
          <Image
            src="https://picsum.photos/seed/building-night/1200/1800"
            alt="Image"
            width="1920"
            height="1080"
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            data-ai-hint="building night"
            priority
          />
        </div>
        <div className="flex items-center justify-center bg-accent">
          <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="flex items-center gap-4">
                        <Icons.hezeeLogo className="size-16 text-primary" />
                        <h1 className="text-5xl font-bold tracking-wider text-primary">HEZEE</h1>
                    </div>
                    <p className="mt-4 text-sm text-foreground/80">
                        For the purpose of industry regulation, your details are required.
                    </p>
                </div>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
    )
}
