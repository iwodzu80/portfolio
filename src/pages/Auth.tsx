import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") === "signup" ? "sign-up" : "sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'recruiter'>('user');

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "signup") {
      setActiveTab("sign-up");
    }
  }, [searchParams]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            role: userRole
          }
        }
      });
      
      if (error) throw error;
      toast.success("Sign-up successful! Please check your email for verification.");
    } catch (error: any) {
      toast.error(error.message || "An error occurred during sign-up");
    } finally {
      setSignUpLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Successfully logged in!");
    } catch (error: any) {
      toast.error(error.message || "Invalid login credentials");
    } finally {
      setSignInLoading(false);
    }
  };


  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`
      });
      
      if (error) throw error;
      toast.success("Password reset email sent! Check your inbox.");
      setShowResetForm(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setResetLoading(false);
    }
  };

  const isLoading = signInLoading || signUpLoading || resetLoading;

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Auth Forms */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Header with Logo */}
        <div className="px-8 py-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-4xl font-outfit font-bold bg-gradient-to-r from-portfolio-violet to-portfolio-celadon bg-clip-text text-transparent">
              clickly.it
            </span>
          </Link>
        </div>

        {/* Auth Content - Centered */}
        <div className="flex-1 flex items-center justify-center px-8 pb-12">
          <div className="w-full max-w-sm space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="sign-in" disabled={isLoading}>Sign In</TabsTrigger>
                <TabsTrigger value="sign-up" disabled={isLoading}>Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="sign-in" className="space-y-4">
                {!showResetForm ? (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="yours@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input 
                          id="password" 
                          type={showPassword ? "text" : "password"} 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading}
                          required
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <LoadingButton 
                      type="submit" 
                      className="w-full" 
                      loading={signInLoading}
                      loadingText="Signing in..."
                      disabled={isLoading}
                    >
                      Continue
                    </LoadingButton>
                    <Button 
                      type="button"
                      variant="link" 
                      size="sm"
                      onClick={() => setShowResetForm(true)}
                      disabled={isLoading}
                      className="w-full text-sm text-muted-foreground"
                    >
                      Forgot your password?
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input 
                        id="reset-email" 
                        type="email" 
                        placeholder="yours@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                    <LoadingButton 
                      type="submit" 
                      className="w-full" 
                      loading={resetLoading}
                      loadingText="Sending reset email..."
                      disabled={isLoading}
                    >
                      Send Reset Email
                    </LoadingButton>
                    <Button 
                      type="button"
                      variant="link" 
                      size="sm"
                      onClick={() => setShowResetForm(false)}
                      disabled={isLoading}
                      className="w-full text-sm text-muted-foreground"
                    >
                      Back to sign in
                    </Button>
                  </form>
                )}
              </TabsContent>
              
              <TabsContent value="sign-up" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="yours@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input 
                        id="signup-password" 
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        required
                        minLength={6}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-role">Account Type</Label>
                    <Select 
                      value={userRole} 
                      onValueChange={(value: 'user' | 'recruiter') => setUserRole(value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="user-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Portfolio Creator</SelectItem>
                        <SelectItem value="recruiter">Recruiter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <LoadingButton 
                    type="submit" 
                    className="w-full" 
                    loading={signUpLoading}
                    loadingText="Creating Account..."
                    disabled={isLoading}
                  >
                    Continue
                  </LoadingButton>
                </form>
              </TabsContent>
            </Tabs>

            <div className="pt-4">
              <Link to="/">
                <Button variant="link" className="text-sm text-muted-foreground gap-2">
                  <Home className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Gradient Background with Mission */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-portfolio-violet via-portfolio-purple to-portfolio-celadon items-center justify-center p-12">
        <div className="text-left space-y-2 max-w-lg">
          <h2 className="text-4xl font-bold text-white leading-relaxed">
            Create stunning portfolio<br />
            Showcase your best work<br />
            <span className="text-5xl font-extrabold">Stand out</span>
          </h2>
        </div>
      </div>
    </div>
  );
};

export default Auth;