/**
 * FUNCTIONAL TESTING: Forms
 * Verifies contact form validation, login/signup form structure.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ContactPage } from '../pages/ContactPage';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: false, login: vi.fn(), signup: vi.fn(), logout: vi.fn() }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../contexts/SubscriptionContext', () => ({
  useSubscription: () => ({
    tier: null, usage: null, loading: false, refreshSubscription: vi.fn(), hasFeature: () => false,
  }),
  SubscriptionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../lib/api', () => ({
  billingApi: { createCheckout: vi.fn(), getPortalUrl: vi.fn() },
  authApi: { login: vi.fn(), signup: vi.fn(), me: vi.fn() },
}));

describe('Contact Form Validation', () => {
  it('shows validation errors when submitting empty form', async () => {
    render(<MemoryRouter><ContactPage /></MemoryRouter>);
    const submitBtn = screen.getByRole('button', { name: /send message/i });
    await userEvent.click(submitBtn);

    expect(screen.getByText(/Name is required/i)).toBeDefined();
    expect(screen.getByText(/Email is required/i)).toBeDefined();
    expect(screen.getByText(/Please select a subject/i)).toBeDefined();
    expect(screen.getByText(/Message is required/i)).toBeDefined();
  });

  it('shows email format error for invalid email', async () => {
    render(<MemoryRouter><ContactPage /></MemoryRouter>);
    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, 'not-an-email');
    const submitBtn = screen.getByRole('button', { name: /send message/i });
    await userEvent.click(submitBtn);

    expect(screen.getByText(/Please enter a valid email/i)).toBeDefined();
  });

  it('shows min length error for short message', async () => {
    render(<MemoryRouter><ContactPage /></MemoryRouter>);

    await userEvent.type(screen.getByLabelText(/^name/i), 'Test');
    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com');
    await userEvent.selectOptions(screen.getByLabelText(/subject/i), 'Bug Report');
    await userEvent.type(screen.getByLabelText(/message/i), 'Short');

    await userEvent.click(screen.getByRole('button', { name: /send message/i }));
    expect(screen.getByText(/at least 10 characters/i)).toBeDefined();
  });

  it('all required fields have labels', () => {
    render(<MemoryRouter><ContactPage /></MemoryRouter>);
    expect(screen.getByLabelText(/^name/i)).toBeDefined();
    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByLabelText(/subject/i)).toBeDefined();
    expect(screen.getByLabelText(/message/i)).toBeDefined();
  });
});

describe('Login Form', () => {
  it('has email and password fields with labels', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
  });

  it('has submit button', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /sign in|log in/i })).toBeDefined();
  });

  it('has link to signup page', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    const signupLink = screen.getByText(/sign up|create.*account/i);
    expect(signupLink.closest('a')).toHaveAttribute('href', '/signup');
  });
});

describe('Signup Form', () => {
  it('has email and password fields with labels', () => {
    render(<MemoryRouter><SignupPage /></MemoryRouter>);
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
  });

  it('has submit button', () => {
    render(<MemoryRouter><SignupPage /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /sign up|create|start/i })).toBeDefined();
  });

  it('has link to login page', () => {
    render(<MemoryRouter><SignupPage /></MemoryRouter>);
    const loginLink = screen.getAllByText(/sign in/i).find(el => el.closest('a'));
    expect(loginLink?.closest('a')).toHaveAttribute('href', '/login');
  });
});
