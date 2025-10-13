'use client';
import { Icons } from "@/components/icons";
import LoginForm from "@/components/auth/login-form";
import Image from "next/image";

export default function LoginPage() {
    return (
      <div className="flex min-h-screen items-stretch bg-background text-foreground">
        <div className="relative hidden w-1/2 flex-col justify-end p-12 lg:flex">
          <Image
            src="https://picsum.photos/seed/bus-interior/1200/1800"
            alt="Interior of a public transport bus"
            fill
            className="object-cover"
            data-ai-hint="bus interior"
            priority
          />
          <div className="relative z-10 rounded-xl bg-black/50 p-6 backdrop-blur-sm">
            <h1 className="text-4xl font-bold text-white">
              StaffWise
            </h1>
            <p className="mt-2 text-lg text-white/80">
              Comprehensive Attendance and Audit Management.
            </p>
          </div>
        </div>
        <div className="flex w-full items-center justify-center bg-accent p-8 lg:w-1/2">
            <div className="w-full max-w-sm">
                <div className="mb-8 flex flex-col items-center text-center">
                    <Icons.hezeeLogo className="size-16 text-primary" />
                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-primary">HEZEE</h1>
                    <p className="mt-2 text-sm text-foreground/80">
                        For the purpose of industry regulation, your details are required.
                    </p>
                </div>
                <LoginForm />
            </div>
        </div>
      </div>
    );
}
