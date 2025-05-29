import React, { createContext, useState, useEffect, useContext } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// Define the Auth context state type
type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null } | null;
  }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null } | null;
  }>;
  signInWithOtp: (email: string) => Promise<{
    error: Error | null;
    data: any;
  }>;
  verifyOtp: (
    email: string,
    token: string
  ) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null } | null;
  }>;
  signOut: () => Promise<void>;
};

// Create the Auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for a user session when the app loads
    const getSession = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getSession();

      if (!error && data && data.session) {
        setSession(data.session);
        setUser(data.session.user);
      }

      setLoading(false);
    };

    getSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sign up function
  const signUp = async (email: string, password: string, fullName: string) => {
    // Sign up the user in auth
    const authResponse = await supabase.auth.signUp({
      email,
      password,
    });

    // If sign up was successful and we have a user
    if (authResponse.data.user && !authResponse.error) {
      // Create the profile in the profiles table
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authResponse.data.user.id,
        email: email,
        full_name: fullName,
        avatar_url: null,
      });

      // If there was an error creating the profile
      if (profileError) {
        console.error("Error creating user profile:", profileError);
        // You might want to handle this error - potentially cleaning up the auth user
        // or showing an error to the user
      }
    }

    return authResponse;
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  };

  // Sign in with OTP function
  const signInWithOtp = async (email: string) => {
    return await supabase.auth.signInWithOtp({
      email,
    });
  };

  // Verify OTP function
  const verifyOtp = async (email: string, token: string) => {
    return await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
  };

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signInWithOtp,
        verifyOtp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using Auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
