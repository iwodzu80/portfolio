
import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Helper to check if current path is a public route
    const isPublicRoute = (pathname: string) => {
      return pathname.startsWith('/shared/') || 
             pathname === '/cookie-policy' ||
             pathname === '/';
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state change:', { event, hasSession: !!currentSession, path: window.location.pathname });
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
        
        // Skip all navigation logic for public routes
        if (isPublicRoute(window.location.pathname)) {
          console.log('Public route detected, skipping navigation');
          return;
        }
        
        // Redirect authenticated users from /auth to dashboard
        if (currentSession?.user && window.location.pathname === '/auth') {
          navigate("/dashboard");
        }
        
        // Handle sign out event - redirect to auth (only for non-public routes)
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Initial session check:', { hasSession: !!currentSession, path: window.location.pathname });
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
      
      // Skip navigation for public routes
      if (isPublicRoute(window.location.pathname)) {
        console.log('Public route detected on initial load, skipping navigation');
        return;
      }
      
      // Redirect authenticated users from /auth to dashboard
      if (currentSession?.user && window.location.pathname === '/auth') {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => {
    try {
      console.log("Attempting to sign out...");
      
      // Clear local state first
      setSession(null);
      setUser(null);
      
      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.log("Sign out error (may be expected if session expired):", error.message);
        // Don't show error to user for session_not_found as it's expected behavior
        if (!error.message.includes("session_not_found") && !error.message.includes("Session not found")) {
          toast.error("Error signing out: " + error.message);
        }
      } else {
        console.log("Successfully signed out");
        toast.success("Logged out successfully");
      }
      
      // Always navigate to auth page regardless of API response
      navigate("/auth");
    } catch (error: any) {
      console.log("Sign out catch error:", error.message);
      // Clear state and navigate even if there's an error
      setSession(null);
      setUser(null);
      navigate("/auth");
      
      if (!error.message.includes("session_not_found") && !error.message.includes("Session not found")) {
        toast.error(error.message || "Error signing out");
      }
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
