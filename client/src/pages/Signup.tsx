import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type SignupForm = {
	full_name: string;
	phone: string;
	email: string;
	password: string;
};

type FormErrors = {
	full_name?: string;
	phone?: string;
	email?: string;
	password?: string;
	submit?: string;
};

const initialForm: SignupForm = {
	full_name: '',
	phone: '',
	email: '',
	password: '',
};

export default function Signup() {
	const [form, setForm] = useState<SignupForm>(initialForm);
	const [errors, setErrors] = useState<FormErrors>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const { signUp } = useAuth();
	const navigate = useNavigate();

	const validate = () => {
		const nextErrors: FormErrors = {};

		if (!form.full_name.trim()) nextErrors.full_name = 'Full name is required';
		else if (form.full_name.trim().length > 255) nextErrors.full_name = 'Full name must be 255 characters or less';

		if (!form.phone.trim()) {
			nextErrors.phone = 'Phone is required';
		} else if (form.phone.trim().length > 20) {
			nextErrors.phone = 'Phone must be 20 characters or less';
		}

		if (!form.email.trim()) {
			nextErrors.email = 'Email is required';
		} else if (form.email.trim().length > 255) {
			nextErrors.email = 'Email must be 255 characters or less';
		} else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
			nextErrors.email = 'Enter a valid email address';
		}

		if (!form.password) nextErrors.password = 'Password is required';
		else if (form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters';

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		console.log('====================================');
		console.log(form);
		console.log('====================================');
		setIsSuccess(false);

		if (!validate()) return;

		try {
			setIsSubmitting(true);
			setErrors({});

			const result = await signUp(form.full_name.trim(), form.phone.trim(), form.email.trim(), form.password);
			if (result.error) {
				setErrors({ submit: result.error });
				return;
			}

			setIsSuccess(true);
			setForm(initialForm);
			navigate('/login');
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Signup failed. Please try again.';
			setErrors({ submit: message });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="auth-page">
			<div className="auth-card">
				<h1>Create Account</h1>
				<p className="subtitle">Use your full name, phone number, email and a password to register.</p>

				<form onSubmit={handleSubmit} noValidate>
					<div className="form-group">
						<label htmlFor="full_name">Full Name</label>
						<input
							id="full_name"
							name="full_name"
							type="text"
							maxLength={255}
							placeholder="Enter your full name"
							value={form.full_name}
							onChange={e => setForm(prev => ({ ...prev, full_name: e.target.value }))}
						/>
						{errors.full_name ? <p className="form-error">{errors.full_name}</p> : null}
					</div>

					<div className="form-group">
						<label htmlFor="phone">Phone</label>
						<input
							id="phone"
							name="phone"
							type="text"
							required
							maxLength={20}
							placeholder="Enter phone number"
							value={form.phone}
							onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
						/>
						{errors.phone ? <p className="form-error">{errors.phone}</p> : null}
					</div>

					<div className="form-group">
						<label htmlFor="email">Email</label>
						<input
							id="email"
							name="email"
							type="email"
							required
							maxLength={255}
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
							required
							placeholder="Enter a password"
							value={form.password}
							onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
						/>
						{errors.password ? <p className="form-error">{errors.password}</p> : null}
					</div>

					{errors.submit ? <p className="form-error">{errors.submit}</p> : null}
					{isSuccess ? <p style={{ color: 'var(--accent-700)', marginBottom: 12 }}>Account created successfully.</p> : null}

					<button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
						{isSubmitting ? 'Creating account...' : 'Create Account'}
					</button>
				</form>

				<p className="auth-link">
					Already have an account? <Link to="/login">Sign In</Link>
				</p>
			</div>
		</div>
	);
}
