import React from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = supabase.auth.getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}