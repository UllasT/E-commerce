import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type LoginForm = {
	email: string;
	password: string;
};

type FormErrors = {
	email?: string;
	password?: string;
	submit?: string;
};

const initialForm: LoginForm = {
	email: '',
	password: '',
};

export default function Login() {
	const [form, setForm] = useState<LoginForm>(initialForm);
	const [errors, setErrors] = useState<FormErrors>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const navigate = useNavigate();
	const { signIn } = useAuth();

	const validate = () => {
		const nextErrors: FormErrors = {};

		if (!form.email.trim()) {
			nextErrors.email = 'Email is required';
		} else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
			nextErrors.email = 'Enter a valid email address';
		}

		if (!form.password) {
			nextErrors.password = 'Password is required';
		} else if (form.password.length < 6) {
			nextErrors.password = 'Password must be at least 6 characters';
		}

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!validate()) {
			return;
		}

		try {
			setIsSubmitting(true);
			setErrors({});

			const result = await signIn(form.email.trim(), form.password);
			if (result.error) {
				setErrors({ submit: result.error });
				return;
			}

			setForm(initialForm);
			navigate('/');
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
			setErrors({ submit: message });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="auth-page">
			<div className="auth-card">
				<h1>Welcome Back</h1>
				<p className="subtitle">Sign in with your email and password.</p>

				<form onSubmit={handleSubmit} noValidate>
					<div className="form-group">
						<label htmlFor="email">Email</label>
						<input
							id="email"
							name="email"
							type="email"
							autoComplete="email"
							placeholder="you@example.com"
							value={form.email}
							onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
						/>
						{errors.email ? <p className="form-error">{errors.email}</p> : null}
					</div>

					<div className="form-group">
						<label htmlFor="password">Password</label>
						<input
							id="password"
							name="password"
							type="password"
							autoComplete="current-password"
							placeholder="Enter your password"
							value={form.password}
							onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
						/>
						{errors.password ? <p className="form-error">{errors.password}</p> : null}
					</div>

					{errors.submit ? <p className="form-error">{errors.submit}</p> : null}

					<button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
						{isSubmitting ? 'Signing in...' : 'Sign In'}
					</button>
				</form>

				<p className="auth-link">
					New here? <Link to="/signup">Create an account</Link>
				</p>
			</div>
		</div>
	);
}
