'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';


export default function LoginForm() {
  const [email, setEmail] = useState('demo@staffwise.com');
  const [password, setPassword] = useState('demopass');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Signed in successfully!',
          description: "Welcome back!",
        });
        router.push('/');
    } catch (error: any) {
        let description = 'An unexpected error occurred.';
        if (error.code) {
            switch(error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    description = 'Invalid email or password. Please try again.';
                    break;
                case 'auth/invalid-email':
                    description = 'Please enter a valid email address.';
                    break;
                default:
                    description = 'Please check your credentials and try again.';
            }
        }
        toast({
          variant: 'destructive',
          title: 'Sign in failed',
          description,
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            />
        </div>
        <div className="flex items-center justify-between">
            <div/>
            <Link href="#" className="text-sm text-primary/80 hover:text-primary hover:underline">
                Forgot Password?
            </Link>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Sign In
        </Button>
    </form>
  );
}
