import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import ThemeToggle from './ThemeToggle';

export default function AuthForm({ mode }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        await register(form);
      } else {
        await login({ username: form.username, password: form.password });
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{mode === 'register' ? 'Join T Social' : 'Welcome back'}</CardTitle>
          <CardDescription>
            {mode === 'register'
              ? 'Create an account to post tees and follow people.'
              : 'Log in to see your feed.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            {mode === 'register' && (
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name} onChange={update('name')} required />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={form.username} onChange={update('username')} required autoComplete="username" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={update('password')}
                required
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
            </div>

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? 'Please wait…' : mode === 'register' ? 'Sign up' : 'Log in'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <p className="text-sm text-muted-foreground">
            {mode === 'register' ? (
              <>
                Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
              </>
            ) : (
              <>
                New here? <Link to="/register" className="text-primary hover:underline font-medium">Create an account</Link>
              </>
            )}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
