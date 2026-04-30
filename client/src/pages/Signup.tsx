import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';

type SignupForm = {
	full_name: string;
	phone: string;
	email: string;
};

type FormErrors = {
	full_name?: string;
	phone?: string;
	email?: string;
	submit?: string;
};

const initialForm: SignupForm = {
	full_name: '',
	phone: '',
	email: '',
};

export default function Signup() {
	const [form, setForm] = useState<SignupForm>(initialForm);
	const [errors, setErrors] = useState<FormErrors>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	const validate = () => {
		const nextErrors: FormErrors = {};

		if (form.full_name.trim().length > 255) {
			nextErrors.full_name = 'Full name must be 255 characters or less';
		}

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

		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSuccess(false);

		if (!validate()) {
			return;
		}

		try {
			setIsSubmitting(true);
			setErrors({});

			const response = await fetch('/api/sql/users/create', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					full_name: form.full_name.trim(),
					phone: form.phone.trim(),
					email: form.email.trim(),
					phoneemail: form.email.trim(),
				}),
			});

			if (!response.ok) {
				throw new Error('Unable to create account right now');
			}

			setIsSuccess(true);
			setForm(initialForm);
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
				<p className="subtitle">Use your full name, phone number, and email to register.</p>

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
