"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface AuthPanelProps {
  className?: string;
  loading?: boolean;
  googleLoading?: boolean;
  onLogin: (email: string, password: string) => void | Promise<void>;
  onSignup: (data: { email: string; password: string; username?: string; fullName?: string }) => void | Promise<void>;
  onGoogle: () => void | Promise<void>;
  onForgotPassword: () => void;
  rateLimitMessage?: string | null;
}

const container = {
  hidden: { opacity: 0, scale: 0.97 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" as const, staggerChildren: 0.05 },
  },
} as const;
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } } as const;

function GoogleSvg() {
  return (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export function AuthPanel({
  className,
  loading,
  googleLoading,
  onLogin,
  onSignup,
  onGoogle,
  onForgotPassword,
  rateLimitMessage,
}: AuthPanelProps) {
  const [loginEmail, setLoginEmail] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");
  const [signupEmail, setSignupEmail] = React.useState("");
  const [signupPassword, setSignupPassword] = React.useState("");
  const [signupUsername, setSignupUsername] = React.useState("");
  const [signupFullName, setSignupFullName] = React.useState("");

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={cn(
        "relative w-full max-w-md rounded-3xl p-6 sm:p-8",
        "bg-background/70 backdrop-blur-2xl backdrop-saturate-150",
        "border border-border shadow-2xl shadow-foreground/10",
        className,
      )}
    >
      <motion.div variants={item} className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Welcome to VirtuLab</h2>
        <p className="text-sm text-muted-foreground mt-1">Sign in or create an account to continue</p>
      </motion.div>

      <Tabs defaultValue="login" className="w-full">
        <motion.div variants={item}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Log In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
        </motion.div>

        <TabsContent value="login" className="mt-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void onLogin(loginEmail, loginPassword);
            }}
            className="space-y-4"
          >
            <motion.div variants={item} className="space-y-2">
              <Label htmlFor="ap-login-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="ap-login-email" type="email" autoComplete="email" required maxLength={254} value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="pl-10" placeholder="you@example.com" />
              </div>
            </motion.div>
            <motion.div variants={item} className="space-y-2">
              <Label htmlFor="ap-login-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="ap-login-password" type="password" autoComplete="current-password" required maxLength={128} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="pl-10" placeholder="••••••••" />
              </div>
            </motion.div>
            <motion.div variants={item} className="flex justify-end">
              <button type="button" onClick={onForgotPassword} className="text-sm text-primary hover:underline">
                Forgot password?
              </button>
            </motion.div>
            {rateLimitMessage && (
              <p className="text-xs text-destructive text-center">{rateLimitMessage}</p>
            )}
            <motion.div variants={item}>
              <Button type="submit" className="w-full" disabled={loading || !!rateLimitMessage}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Log In
              </Button>
            </motion.div>
          </form>
        </TabsContent>

        <TabsContent value="signup" className="mt-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void onSignup({ email: signupEmail, password: signupPassword, username: signupUsername || undefined, fullName: signupFullName || undefined });
            }}
            className="space-y-4"
          >
            <motion.div variants={item} className="space-y-2">
              <Label htmlFor="ap-signup-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="ap-signup-email" type="email" autoComplete="email" required maxLength={254} value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} className="pl-10" placeholder="you@example.com" />
              </div>
            </motion.div>
            <motion.div variants={item} className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ap-signup-username">Username</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="ap-signup-username" type="text" autoComplete="username" maxLength={32} value={signupUsername} onChange={(e) => setSignupUsername(e.target.value)} className="pl-10" placeholder="scientist42" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ap-signup-fullname">Full Name</Label>
                <Input id="ap-signup-fullname" type="text" autoComplete="name" maxLength={80} value={signupFullName} onChange={(e) => setSignupFullName(e.target.value)} placeholder="Jane Doe" />
              </div>
            </motion.div>
            <motion.div variants={item} className="space-y-2">
              <Label htmlFor="ap-signup-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="ap-signup-password" type="password" autoComplete="new-password" required maxLength={128} value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className="pl-10" placeholder="••••••••" />
              </div>
              <p className="text-xs text-muted-foreground">At least 8 characters with uppercase, lowercase, and a number.</p>
            </motion.div>
            {rateLimitMessage && (
              <p className="text-xs text-destructive text-center">{rateLimitMessage}</p>
            )}
            <motion.div variants={item}>
              <Button type="submit" className="w-full" disabled={loading || !!rateLimitMessage}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Create Account
              </Button>
            </motion.div>
          </form>
        </TabsContent>
      </Tabs>

      <motion.div variants={item} className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background/0 px-2 text-muted-foreground">Or continue with</span>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <Button type="button" variant="outline" className="w-full" onClick={onGoogle} disabled={googleLoading}>
          {googleLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <GoogleSvg />}
          Continue with Google
        </Button>
      </motion.div>

      <motion.p variants={item} className="text-center text-xs text-muted-foreground mt-6">
        By continuing, you agree to VirtuLab's Terms of Service and Privacy Policy.
      </motion.p>
    </motion.div>
  );
}
