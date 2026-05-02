import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import axios from 'axios';

type User = {
	id: string;
	email?: string;
	full_name?: string;
	phone?: string;
};

interface AuthContextType {
	user: User | null;
	loading: boolean;
	signIn: (email: string, password: string) => Promise<{ error: string | null }>;
	signUp: (name: string, phone: string, email: string, password: string) => Promise<{ error: string | null }>;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';

function getApiBase() {
	const base = (import.meta.env.VITE_API_URL as string) || '/api/';
	return base.endsWith('/') ? base : `${base}/`;
}

const api = axios.create({ baseURL: getApiBase() });

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchProfile = async (token: string) => {
		try {
			const res = await api.get('users/profile', { headers: { Authorization: `Bearer ${token}` } });
			return res.data?.user ?? null;
		} catch (err) {
			return null;
		}
	};

	useEffect(() => {
		(async () => {
			const token = localStorage.getItem(TOKEN_KEY);
			if (!token) {
				setLoading(false);
				return;
			}
			const profile = await fetchProfile(token);
			if (profile) setUser(profile as User);
			else localStorage.removeItem(TOKEN_KEY);
			setLoading(false);
		})();
	}, []);

	const signIn = async (email: string, password: string) => {
		try {
			const res = await api.post('users/login', { email, password });
			const token = res.data?.token as string | undefined;
			if (!token) return { error: 'No token returned from server' };
			localStorage.setItem(TOKEN_KEY, token);
			const profile = await fetchProfile(token);
			if (profile) setUser(profile as User);
			return { error: null };
		} catch (err: any) {
			const message = err?.response?.data?.message || err.message || 'Login failed';
			return { error: message };
		}
	};

	const signUp = async (name: string, phone: string, email: string, password: string) => {
		try {
			const res = await api.post('users/create', { name, email, phone, password });
			return { error: null };
		} catch (err: any) {
            console.log(err);
            
			const message = err?.response?.data?.message || err.message || 'Signup failed';
			return { error: message };
		}
	};

	const signOut = async () => {
		localStorage.removeItem(TOKEN_KEY);
		setUser(null);
	};

	return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used within AuthProvider');
	return ctx;
}
