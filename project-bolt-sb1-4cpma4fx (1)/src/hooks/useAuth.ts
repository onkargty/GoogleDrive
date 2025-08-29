import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Auth session error:', error);
      }
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((error) => {
      console.error('Failed to get session:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) {
        console.error('Sign up error:', error);
        return { data, error };
      }

      // If user is created but not confirmed, that's still success
      if (data.user && !data.user.email_confirmed_at) {
        console.log('User created successfully, email confirmation not required');
      }

      return { data, error };
    } catch (err) {
      console.error('Sign up exception:', err);
      return { 
        data: null, 
        error: { 
          message: err instanceof Error ? err.message : 'Failed to create account'
        } 
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
      }
      
      return { data, error };
    } catch (err) {
      console.error('Sign in exception:', err);
      return { 
        data: null, 
        error: { 
          message: err instanceof Error ? err.message : 'Failed to sign in'
        } 
      };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
      return { error };
    } catch (err) {
      console.error('Sign out exception:', err);
      return { 
        error: { 
          message: err instanceof Error ? err.message : 'Failed to sign out'
        } 
      };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        console.error('Reset password error:', error);
      }
      return { data, error };
    } catch (err) {
      console.error('Reset password exception:', err);
      return { 
        data: null, 
        error: { 
          message: err instanceof Error ? err.message : 'Failed to send reset email'
        } 
      };
    }
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };
}