import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Eye, EyeOff, Lock, AlertTriangle } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (token: string, user: any) => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const navigate = useNavigate();

  // Check if already logged in as admin
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      // Verify token validity
      verifyAdminSession(token);
    }
  }, []);

  const verifyAdminSession = async (token: string) => {
    try {
      console.log('Verifying admin session...');
      const response = await fetch('/api/admin/verify-session', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'same-origin'
      });

      console.log('Session verification status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Session verified, user:', data.user.email);
        onLogin(token, data.user);
        navigate('/admin/dashboard');
      } else {
        console.warn('Session verification failed, clearing token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    } catch (error) {
      console.error('Session verification error:', error);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create the request body
      const requestBody = {
        email: email.trim(),
        password,
        adminCode: adminCode.trim()
      };

      console.log('Admin login attempt:', { email: requestBody.email, hasPassword: !!requestBody.password, hasAdminCode: !!requestBody.adminCode });

      // Use a more robust fetch approach
      let response;
      let data;

      try {
        response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        console.log('Response status:', response.status);

        // Read response text first, then parse JSON
        const responseText = await response.text();
        console.log('Raw response text:', responseText);

        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            throw new Error('Server returned invalid JSON');
          }
        } else {
          throw new Error('Empty response from server');
        }
      } catch (networkError) {
        console.error('Network error:', networkError);
        throw new Error('Network connection failed');
      }

      console.log('Parsed response data:', data);

      if (response.ok) {
        // Store admin token
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));

        // Call parent login handler
        onLogin(data.token, data.user);

        // Reset form
        setEmail('');
        setPassword('');
        setAdminCode('');
        setLoginAttempts(0);

        console.log('Admin login successful, navigating to dashboard');
        // Navigate to admin dashboard
        navigate('/admin/dashboard');
      } else {
        const errorMessage = data.error || 'Admin login failed';
        console.warn('Admin login failed:', errorMessage, data.code);
        setError(errorMessage);
        setLoginAttempts(prev => prev + 1);

        // Clear sensitive fields on error
        if (data.code === 'INVALID_ADMIN_CODE') {
          setAdminCode('');
        }
        if (data.code === 'INVALID_ADMIN_CREDENTIALS') {
          setPassword('');
        }
      }
    } catch (error) {
      console.error('Admin login error:', error);

      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Network connection error. Please check your connection and try again.');
      } else if (error.message.includes('JSON')) {
        setError('Server response error. Please try again or contact support.');
      } else {
        setError(`Login error: ${error.message}`);
      }

      setLoginAttempts(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email.trim() && password && adminCode.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Master Admin</h1>
            <p className="text-slate-400 mt-2">ApprenticeApex Platform Administration</p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Secure Admin Access
            </CardTitle>
            <CardDescription className="text-slate-400">
              Enter your master admin credentials to access the platform dashboard
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="bg-red-900/50 border-red-500">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Login Attempts Warning */}
              {loginAttempts >= 2 && (
                <Alert className="bg-amber-900/50 border-amber-500">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-amber-200">
                    {loginAttempts >= 3 ? 
                      'Account may be locked after failed attempts. Please contact system administrator.' :
                      `${3 - loginAttempts} attempt(s) remaining before account lock.`
                    }
                  </AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@apprenticeapex.com"
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  required
                  disabled={loading}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 pr-10"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Admin Access Code */}
              <div className="space-y-2">
                <Label htmlFor="adminCode" className="text-slate-300">Admin Access Code</Label>
                <Input
                  id="adminCode"
                  type="password"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="Enter admin access code"
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-slate-500">
                  Additional security layer required for admin access
                </p>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={!isFormValid || loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Authenticating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Access Admin Panel
                  </div>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Security Notice */}
        <div className="text-center space-y-2">
          <p className="text-xs text-slate-500">
            This is a secure administrative interface. All access is logged and monitored.
          </p>
          <p className="text-xs text-slate-600">
            Unauthorized access is prohibited and may result in legal action.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
