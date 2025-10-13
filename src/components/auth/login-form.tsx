'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
        toast({
            variant: 'destructive',
            title: 'Authentication service not available',
            description: 'Please try again later.',
        });
        return;
    }
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Signed in successfully!',
        description: "Welcome back!",
      });
      router.push('/');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Sign in failed',
        description: error.message || 'Please check your credentials and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-6">
        <div className="space-y-2 text-left">
            <Label htmlFor="email">Email</Label>
            <Input
            id="email"
            type="email"
            placeholder="thiru.vikram@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="bg-input border-border/50 focus:border-primary"
            />
        </div>
        <div className="space-y-2 text-left">
            <Label htmlFor="password">Password</Label>
            <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            placeholder="••••••••"
            className="bg-input border-border/50 focus:border-primary"
            />
        </div>
        <div className="flex items-center justify-end">
            <Link href="#" className="text-sm text-primary/80 hover:text-primary hover:underline">
                Forgot Password?
            </Link>
        </div>
        <Button type="submit" className="w-full !mt-8" size="lg" disabled={isLoading}>
            {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            SIGN IN
        </Button>
    </form>
  );
}
