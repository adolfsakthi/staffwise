'use client';
import { Icons } from "@/components/icons";
import LoginForm from "@/components/auth/login-form";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="mb-4 flex justify-center">
                        <Icons.logo className="size-12 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">
                        StaffWise
                    </CardTitle>
                    <CardDescription>
                        Welcome back. Please sign in to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginForm />
                </CardContent>
            </Card>
        </div>
    )
}
