
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Auth = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
      toast.success(t('auth.signUpSuccess'));
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
      toast.success(t('auth.signInSuccess'));
    } catch (error: any) {
      toast.error(error.message || t('auth.invalidCredentials'));
    } finally {
      setSignInLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || t('auth.googleSignInError'));
      setGoogleLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error(t('auth.enterEmail'));
      return;
    }
    
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`
      });
      
      if (error) throw error;
      toast.success(t('auth.resetEmailSent'));
      setShowResetForm(false);
    } catch (error: any) {
      toast.error(error.message || t('auth.resetEmailError'));
    } finally {
      setResetLoading(false);
    }
  };

  const isLoading = signInLoading || signUpLoading || googleLoading || resetLoading;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('auth.title')}</CardTitle>
          <CardDescription>{t('auth.subtitle')}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <LoadingButton 
            onClick={handleGoogleSignIn}
            loading={googleLoading}
            loadingText={t('auth.signingInWithGoogle')}
            variant="outline"
            className="w-full flex items-center gap-2"
            disabled={isLoading}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('auth.continueWithGoogle')}
          </LoadingButton>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">{t('auth.orContinueWith')}</span>
            </div>
          </div>
        </CardContent>

        <Tabs defaultValue="sign-in" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign-in" disabled={isLoading}>{t('auth.signIn')}</TabsTrigger>
            <TabsTrigger value="sign-up" disabled={isLoading}>{t('auth.signUp')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sign-in">
            {!showResetForm ? (
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder={t('auth.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('auth.password')}</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                  <LoadingButton 
                    type="submit" 
                    className="w-full" 
                    loading={signInLoading}
                    loadingText={t('auth.signingIn')}
                    disabled={isLoading}
                  >
                    {t('auth.signIn')}
                  </LoadingButton>
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowResetForm(true)}
                    disabled={isLoading}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {t('auth.forgotPassword')}
                  </Button>
                </CardFooter>
              </form>
            ) : (
                <form onSubmit={handlePasswordReset}>
                  <CardContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">{t('auth.email')}</Label>
                      <Input 
                        id="reset-email" 
                        type="email" 
                        placeholder={t('auth.emailPlaceholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('auth.resetEmailDescription')}
                    </p>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-2">
                    <LoadingButton 
                      type="submit" 
                      className="w-full" 
                      loading={resetLoading}
                      loadingText={t('auth.sendingResetEmail')}
                      disabled={isLoading}
                    >
                      {t('auth.sendResetEmail')}
                    </LoadingButton>
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowResetForm(false)}
                      disabled={isLoading}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {t('auth.backToSignIn')}
                    </Button>
                  </CardFooter>
                </form>
            )}
          </TabsContent>
          
          <TabsContent value="sign-up">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">{t('auth.email')}</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder={t('auth.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t('auth.password')}</Label>
                  <Input 
                    id="signup-password" 
                    type="password"
                    placeholder={t('auth.passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <LoadingButton 
                  type="submit" 
                  className="w-full" 
                  loading={signUpLoading}
                  loadingText={t('auth.creatingAccount')}
                  disabled={isLoading}
                >
                  {t('auth.createAccount')}
                </LoadingButton>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
