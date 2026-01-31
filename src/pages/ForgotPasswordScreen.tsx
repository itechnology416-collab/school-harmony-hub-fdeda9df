import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, GraduationCap, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to send reset email. Please try again.');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="gradient-hero relative overflow-hidden px-6 pt-12 pb-20">
          <button
            onClick={() => navigate('/login')}
            className="absolute top-4 left-4 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold font-display text-white mb-1">
              Check Your Email
            </h1>
          </div>
        </div>

        <div className="flex-1 bg-background -mt-8 rounded-t-3xl px-6 pt-8 pb-8">
          <div className="max-w-sm mx-auto text-center">
            <p className="text-muted-foreground mb-6">
              We've sent a password reset link to <strong className="text-foreground">{email}</strong>. 
              Please check your inbox and follow the instructions to reset your password.
            </p>
            
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Back to Login
            </Button>

            <p className="text-sm text-muted-foreground mt-6">
              Didn't receive the email?{' '}
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="text-primary hover:underline font-medium"
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero Section */}
      <div className="gradient-hero relative overflow-hidden px-6 pt-12 pb-20">
        <button
          onClick={() => navigate('/login')}
          className="absolute top-4 left-4 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full" />
        
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-4">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold font-display text-white mb-1">
            Forgot Password
          </h1>
          <p className="text-white/80 text-sm">
            We'll send you a reset link
          </p>
        </div>
      </div>

      {/* Reset Form */}
      <div className="flex-1 bg-background -mt-8 rounded-t-3xl px-6 pt-8 pb-8">
        <div className="max-w-sm mx-auto">
          <p className="text-muted-foreground text-sm text-center mb-6">
            Enter your email address and we'll send you instructions to reset your password.
          </p>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full mt-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-primary hover:underline font-medium"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;
