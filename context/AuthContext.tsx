import React, { createContext, useState, useEffect, useContext } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  registerForPushNotificationsAsync,
  savePushToken,
  subscribeToLocationShares,
  unsubscribeFromLocationShares,
} from "@/lib/notifications";

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
  const [notificationSubscription, setNotificationSubscription] =
    useState<any>(null);

  // Setup notifications for authenticated user
  const setupNotifications = async (userId: string) => {
    try {
      // Register for local notifications (no Firebase needed)
      const token = await registerForPushNotificationsAsync();
      if (token) {
        // For local notifications, we don't need to save the token
        // Just log that notifications are ready
        console.log("📱 Local notifications ready for user:", userId);
      }

      // Subscribe to location share notifications
      const subscription = subscribeToLocationShares(userId);
      setNotificationSubscription(subscription);
    } catch (error) {
      console.error("Error setting up notifications:", error);
    }
  };

  // Cleanup notifications
  const cleanupNotifications = () => {
    if (notificationSubscription) {
      unsubscribeFromLocationShares(notificationSubscription);
      setNotificationSubscription(null);
    }
  };

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

        // Setup or cleanup notifications based on auth state
        if (session?.user) {
          await setupNotifications(session.user.id);
        } else {
          cleanupNotifications();
        }
      }
    );

    // Cleanup subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sign up function
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const authResponse = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authResponse.error) {
        throw authResponse.error;
      }

      // Don't manually insert profile - let the database trigger handle it
      return { data: authResponse.data, error: null };
    } catch (error: any) {
      console.error("Sign up error:", error);
      return { data: null, error };
    }
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
    cleanupNotifications();
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
