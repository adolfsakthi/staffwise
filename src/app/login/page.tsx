
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useAuth, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';

const HezeeLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21.16,35.6c-6.16,0-10.72-4.52-10.72-10.6V10.8H5.2v14.2c0,8.8,6.84,15.6,15.96,15.6s15.96-6.8,15.96-15.6V10.8h-5.24v14.2C25.92,31.08,24.4,35.6,21.16,35.6z" fill="#3A4D39"/>
        <path d="M51.04,39.6c-10.2,0-18.48-8.28-18.48-18.48S40.84,2.64,51.04,2.64s18.48,8.28,18.48,18.48S61.24,39.6,51.04,39.6z M51.04,7.88c-7.32,0-13.24,5.92-13.24,13.24s5.92,13.24,13.24,13.24s13.24-5.92,13.24-13.24S58.36,7.88,51.04,7.88z" fill="#3A4D39"/>
        <path d="M79.92,10.8h-5.24v10.24h10.24v-4.6H79.92V10.8z M74.68,25.68h5.24v9.92h5.24v-9.92h5.24v-5.24h-5.24v-4.6h10.24V5.4h-20.72v20.28H74.68z" fill="#3A4D39"/>
        <path d="M109.84,21.04h-5.24v14.56h-5.24V5.4h15.72c6.28,0,11.36,5.08,11.36,11.36S116.12,28.12,109.84,28.12h-5.24v-7.08h5.24c3.4,0,6.12-2.72,6.12-6.12s-2.72-6.12-6.12-6.12h-10.48v16.48h5.24V21.04z" fill="#3A4D39"/>
        <path d="M137.76,10.8h-5.24v10.24h10.24v-4.6h-5.0v-5.64z M132.52,25.68h5.24v9.92h5.24v-9.92h5.24v-5.24h-5.24v-4.6h10.24V5.4h-20.72v20.28h5.24z" fill="#3A4D39"/>
    </svg>
)

export default function LoginPage() {
  const auth = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('demo@staffwise.com');
  const [password, setPassword] = useState('password');
  const [propertyCode, setPropertyCode] = useState('PROP-001');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password || !propertyCode) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please enter email, password, and property code.',
      });
      return;
    }
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        const firestore = getFirestore();
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          throw new Error('User profile not found in database.');
        }
        
        const userProfile = userDoc.data();
        if (userProfile.property_code !== propertyCode) {
          throw new Error('Property code does not match.');
        }
        // Success! Redirect is handled by the root layout's AuthWrapper
      }
    } catch (error: any) {
      // Sign out if any part of the custom verification fails
      if(auth.currentUser) {
          await auth.signOut();
      }

      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'An unknown error occurred.',
      });
       setIsLoading(false); // Only set to false on error
    }
  };
  
  return (
    <div className="w-full min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:block relative">
          <Image
              src="https://picsum.photos/seed/building/1080/1920"
              alt="An elegant building at night"
              layout="fill"
              objectFit="cover"
              data-ai-hint="night building"
          />
          <div className="absolute inset-0 bg-black/60" />
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background relative">
        <div 
          className="absolute top-0 right-0 h-32 w-32 bg-repeat" 
          style={{
            backgroundImage: 'radial-gradient(hsl(var(--primary) / 0.2) 1px, transparent 1px)',
            backgroundSize: '10px 10px',
          }}
        />
        <div className="mx-auto grid w-[380px] gap-8 z-10">
            <div className="grid gap-4">
                <HezeeLogo className="h-10 text-primary" />
                 <h1 className="text-3xl font-semibold tracking-tight">Admin Portal</h1>
                <p className="text-muted-foreground">
                    Enter your credentials to access the dashboard.
                </p>
            </div>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="property-code">Property Code</Label>
                <Input
                  id="property-code"
                  type="text"
                  placeholder="PROP-001"
                  required
                  value={propertyCode}
                  onChange={(e) => setPropertyCode(e.target.value)}
                />
              </div>
              <Button onClick={handleLogin} disabled={isLoading} className="w-full h-12 text-base">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
