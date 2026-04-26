// import { createContext, useContext, type ReactNode } from 'react';

// interface AuthContextType {
//   user: null;
//   loading: boolean;
//   signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
//   signIn: (email: string, password: string) => Promise<{ error: string | null }>;
//   signOut: () => Promise<void>;
//   resetPassword: (email: string) => Promise<{ error: string | null }>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const user = null;
//   const loading = false;
//   const signUp = async () => ({ error: 'Authentication is disabled in this client' });
//   const signIn = async () => ({ error: 'Authentication is disabled in this client' });
//   const signOut = async () => {};
//   const resetPassword = async () => ({ error: 'Authentication is disabled in this client' });

//   return (
//     <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, resetPassword }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error('useAuth must be used within AuthProvider');
//   return context;
// }
