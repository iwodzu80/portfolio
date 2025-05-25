
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  const [resendingEmail, setResendingEmail] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleResendConfirmationEmail = async () => {
    try {
      setResendingEmail(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user?.email || '',
      });
      
      if (error) throw error;
      
      toast.success("Verification email sent! Please check your inbox and spam folder.");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend verification email");
    } finally {
      setResendingEmail(false);
    }
  };

  const handleRefreshVerification = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      if (data.user?.email_confirmed_at) {
        toast.success("Email verified! Redirecting...");
        window.location.reload();
      } else {
        toast.info("Email not yet verified. Please check your inbox.");
      }
    } catch (error: any) {
      toast.error("Failed to check verification status");
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // No user, redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if email has been confirmed
  if (user && !user.email_confirmed_at) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Email Verification Required
            </CardTitle>
            <CardDescription>
              Your account has been created, but we need to verify your email address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              We've sent a verification email to <strong>{user.email}</strong>. Please check your inbox 
              and click the verification link.
            </p>
            <p className="text-sm text-gray-600">
              If you didn't receive the email, check your spam folder or click the button below to resend it.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <LoadingButton 
              onClick={handleResendConfirmationEmail}
              loading={resendingEmail}
              loadingText="Sending..."
              className="w-full"
            >
              Resend Verification Email
            </LoadingButton>
            <LoadingButton 
              variant="outline" 
              className="w-full"
              onClick={handleRefreshVerification}
              loading={refreshing}
              loadingText="Checking..."
            >
              I've Verified My Email
            </LoadingButton>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // User is authenticated and verified, allow access to protected route
  return <Outlet />;
};

export default ProtectedRoute;
