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
      console.log('Existing admin token found, verifying...');
      verifyAdminSession(token);
    }
  }, []);

  const verifyAdminSession = async (token: string) => {
    try {
      console.log('Verifying admin session...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('/api/admin/verify-session', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('Session verification response status:', response.status);

      if (response.ok) {
        const text = await response.text();
        console.log('Session verification response text:', text);
        
        if (text) {
          const data = JSON.parse(text);
          console.log('Session verified successfully for:', data.user.email);
          onLogin(token, data.user);
          navigate('/admin/dashboard');
        }
      } else {
        console.warn('Session verification failed, clearing tokens');
        clearAdminSession();
      }
    } catch (error) {
      console.error('Session verification error:', error);
      clearAdminSession();
    }
  };

  const clearAdminSession = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) {
      console.log('Login already in progress, ignoring submit');
      return;
    }

    setLoading(true);
    setError('');

    // Validate inputs
    if (!email.trim() || !password || !adminCode.trim()) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    const requestBody = {
      email: email.trim(),
      password,
      adminCode: adminCode.trim()
    };

    console.log('🔐 Starting admin login attempt:', { 
      email: requestBody.email, 
      hasPassword: !!requestBody.password, 
      hasAdminCode: !!requestBody.adminCode 
    });

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error('Request timeout after 15 seconds');
      }, 15000);

      console.log('🔐 Sending login request to /api/admin/login');
      
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('🔐 Response received - Status:', response.status);
      console.log('🔐 Response Content-Type:', response.headers.get('content-type'));

      // Read response as text first to avoid body stream issues
      let responseText = '';
      try {
        responseText = await response.text();
        console.log('🔐 Raw response text length:', responseText.length);
        console.log('🔐 Raw response text:', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
      } catch (textError) {
        console.error('❌ Failed to read response text:', textError);
        throw new Error('Failed to read server response');
      }

      // Parse JSON from text
      let data;
      if (responseText) {
        try {
          data = JSON.parse(responseText);
          console.log('🔐 Parsed response data:', { success: data.success, hasToken: !!data.token, userEmail: data.user?.email });
        } catch (parseError) {
          console.error('❌ JSON parse error:', parseError);
          console.error('❌ Response text that failed to parse:', responseText);
          throw new Error('Server returned invalid JSON response');
        }
      } else {
        throw new Error('Empty response from server');
      }

      if (response.ok && data.success) {
        console.log('✅ Admin login successful!');
        
        // Store admin credentials
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        
        // Call parent login handler
        onLogin(data.token, data.user);
        
        // Reset form
        setEmail('');
        setPassword('');
        setAdminCode('');
        setLoginAttempts(0);
        
        console.log('🔐 Navigating to admin dashboard...');
        navigate('/admin/dashboard');
        
      } else {
        // Handle login failure
        const errorMessage = data?.error || `Login failed (Status: ${response.status})`;
        const errorCode = data?.code || 'UNKNOWN_ERROR';
        
        console.warn('❌ Admin login failed:', errorMessage, errorCode);
        setError(errorMessage);
        setLoginAttempts(prev => prev + 1);
        
        // Clear sensitive fields on specific errors
        if (errorCode === 'INVALID_ADMIN_CODE') {
          setAdminCode('');
        }
        if (errorCode === 'INVALID_ADMIN_CREDENTIALS') {
          setPassword('');
        }
      }

    } catch (error) {
      console.error('❌ Login request failed:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout. Please check your connection and try again.';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Network connection error. Please check your connection.';
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Server communication error. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
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
                  autoComplete="email"
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
                    autoComplete="current-password"
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
                  autoComplete="off"
                />
                <p className="text-xs text-slate-500">
                  Additional security layer required for admin access
                </p>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
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
