import React, { useState, useMemo, useCallback, memo } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { getFieldError, emailRules, nameRules } from '@/lib/validation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  signWithEmailAndPassword,
  createCustomer,
  signInWithGoogle,
  linkGoogleCredential
} from '@/firebase/auth';
import { GoogleAuthProvider } from 'firebase/auth';

// --- Shared Components ---

type FormFieldProps = {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  error?: string | null;
  placeholder?: string;
  required?: boolean;
  children?: React.ReactNode;
};

const FormField = memo(({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = true,
  children
}: FormFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      required={required}
    />
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
));

FormField.displayName = 'FormField';

const Divider = memo(({ language }: { language: 'en' | 'sr' }) => (
  <div className="relative my-2">
    <div className="absolute inset-0 flex items-center">
      <span className="w-full border-t border-border" />
    </div>
    <div className="relative flex justify-center text-xs uppercase">
      <span className="bg-background px-2 text-muted-foreground">
        {language === 'en' ? 'Or' : 'Ili'}
      </span>
    </div>
  </div>
));

Divider.displayName = 'Divider';

const SocialAuthButton = memo(({ language, onSuccess, onLinkingRequired }: {
  language: 'en' | 'sr',
  onSuccess: () => void,
  onLinkingRequired: (email: string, credential: any) => void
}) => {

  const handleClick = useCallback(async () => {
    try {
      await signInWithGoogle();
      toast({
        title: language === 'en' ? 'Success' : 'Uspeh',
        description: language === 'en'
          ? 'Successfully authenticated with Google!'
          : 'Uspešno ste se prijavili preko Google-a!',
      });
      onSuccess();
    } catch (error: any) {
      if (error.code === 'auth/account-exists-with-different-credential') {
        const email = error.customData.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
        if (email && credential) {
          onLinkingRequired(email, credential);
          return;
        }
      }

      if (
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/cancelled-popup-request'
      ) {
        return;
      }
      console.error('Google Auth Error:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Greška',
        description: language === 'en'
          ? 'Failed to authenticate with Google. Please try again.'
          : 'Prijava preko Google-a nije uspela. Pokušajte ponovo.',
        variant: 'destructive',
      });
    }
  }, [language, onSuccess, onLinkingRequired]);

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full gap-2"
      onClick={handleClick}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      {language === 'en' ? 'Continue with Google' : 'Nastavi sa Google-om'}
    </Button>
  );
});

SocialAuthButton.displayName = 'SocialAuthButton';

// --- Login Form ---

const LoginForm = memo(({ language, onSuccess }: { language: 'en' | 'sr', onSuccess: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  const markTouched = useCallback((field: string) => setTouched((prev) => ({ ...prev, [field]: true })), []);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value), []);
  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value), []);
  const handleEmailBlur = useCallback(() => markTouched('email'), [markTouched]);
  const handlePasswordBlur = useCallback(() => markTouched('password'), [markTouched]);

  const emailError = touched.email ? getFieldError(email, emailRules, language) : null;
  const passwordError = touched.password && !password.trim()
    ? (language === 'en' ? 'Password is required' : 'Lozinka je obavezna') : null;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const currentEmailError = getFieldError(email, emailRules, language);
    if (currentEmailError || !password.trim()) {
      setTouched({ email: true, password: true });
      return;
    }

    setIsLoading(true);
    try {
      await signWithEmailAndPassword({ email, password });
      toast({
        title: language === 'en' ? 'Login Successful' : 'Uspešna prijava',
        description: language === 'en'
          ? 'Welcome back!'
          : 'Dobrodošli nazad!',
      });
      onSuccess();
    } catch (error: any) {
      console.error('Login Error:', error);
      let errorMessage = language === 'en' ? 'Invalid email or password.' : 'Pogrešna e-pošta ili lozinka.';
      if (error.code === 'auth/too-many-requests') {
        errorMessage = language === 'en' ? 'Too many failed attempts. Please try again later.' : 'Previše neuspelih pokušaja. Pokušajte ponovo kasnije.';
      }
      toast({
        title: language === 'en' ? 'Login Failed' : 'Prijava neuspešna',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [email, password, language, onSuccess]);

  const fields = useMemo(() => [
    {
      id: "loginEmail",
      type: "email",
      label: language === 'en' ? 'Email' : 'E-pošta',
      placeholder: "you@example.com",
      value: email,
      onChange: handleEmailChange,
      onBlur: handleEmailBlur,
      error: emailError
    },
    {
      id: "loginPassword",
      type: "password",
      label: language === 'en' ? 'Password' : 'Lozinka',
      value: password,
      onChange: handlePasswordChange,
      onBlur: handlePasswordBlur,
      error: passwordError
    }
  ], [email, password, language, handleEmailChange, handlePasswordChange, handleEmailBlur, handlePasswordBlur, emailError, passwordError]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {fields.map(field => (
        <FormField key={field.id} {...field} />
      ))}
      <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-burgundy-dark">
        {isLoading
          ? (language === 'en' ? 'Signing In...' : 'Prijavljivanje...')
          : (language === 'en' ? 'Sign In' : 'Prijavi se')}
      </Button>
    </form>
  );
});

LoginForm.displayName = 'LoginForm';

// --- Link Account Form ---

const LinkAccountForm = memo(({
  language,
  email,
  credential,
  onSuccess,
  onCancel
}: {
  language: 'en' | 'sr',
  email: string,
  credential: any,
  onSuccess: () => void,
  onCancel: () => void
}) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    try {
      await linkGoogleCredential(email, password, credential);
      toast({
        title: language === 'en' ? 'Accounts Linked' : 'Nalozi su povezani',
        description: language === 'en'
          ? 'Your Google account is now linked to your email account!'
          : 'Vaš Google nalog je sada povezan sa vašom e-poštom!',
      });
      onSuccess();
    } catch (error: any) {
      console.error('Linking Error:', error);
      let errorMessage = language === 'en' ? 'Incorrect password for account linking.' : 'Pogrešna lozinka za povezivanje naloga.';
      toast({
        title: language === 'en' ? 'Linking Failed' : 'Povezivanje nije uspelo',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [email, password, credential, language, onSuccess]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 bg-muted rounded-md text-sm">
        <p className="font-medium mb-1">
          {language === 'en' ? 'Complete Account Linking' : 'Završite povezivanje naloga'}
        </p>
        <p className="text-muted-foreground text-xs">
          {language === 'en'
            ? `Your email ${email} is already registered. Enter your password to link it with Google.`
            : `Vaša e-pošta ${email} je već registrovana. Unesite lozinku da biste je povezali sa Google-om.`}
        </p>
      </div>

      <FormField
        id="linkPassword"
        type="password"
        label={language === 'en' ? 'Password' : 'Lozinka'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
      />

      <div className="flex gap-3">
        <Button variant="outline" type="button" onClick={onCancel} className="flex-1">
          {language === 'en' ? 'Cancel' : 'Otkaži'}
        </Button>
        <Button type="submit" disabled={isLoading || !password.trim()} className="flex-1 bg-primary">
          {isLoading ? (language === 'en' ? 'Linking...' : 'Povezivanje...') : (language === 'en' ? 'Link Account' : 'Poveži nalog')}
        </Button>
      </div>
    </form>
  );
});

LinkAccountForm.displayName = 'LinkAccountForm';

// --- Register Form ---

const getPasswordRules = (password: string) => [
  { label: { en: "At least 8 characters", sr: "Najmanje 8 karaktera" }, met: password.length >= 8 },
  { label: { en: "At least 1 number", sr: "Minimum 1 broj" }, met: /\d/.test(password) },
  { label: { en: "At least 1 uppercase letter", sr: "Minimum 1 veliko slovo" }, met: /[A-Z]/.test(password) },
  { label: { en: "At least 1 special character", sr: "Minimum 1 specijalni karakter" }, met: /[^A-Za-z0-9]/.test(password) },
];

const PasswordValidation = memo(({ password, language }: { password: string; language: 'en' | 'sr' }) => {
  const rules = useMemo(() => getPasswordRules(password), [password]);
  return (
    <ul className="space-y-1 mt-2">
      {rules.map((rule, i) => (
        <li key={i} className={`flex items-center gap-2 text-xs ${rule.met ? 'text-green-600' : 'text-muted-foreground'}`}>
          {rule.met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          {language === 'en' ? rule.label.en : rule.label.sr}
        </li>
      ))}
    </ul>
  );
});

PasswordValidation.displayName = 'PasswordValidation';

const RegisterForm = memo(({ language, onSuccess }: { language: 'en' | 'sr', onSuccess: () => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  const markTouched = useCallback((field: string) => setTouched((prev) => ({ ...prev, [field]: true })), []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value), []);
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value), []);
  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value), []);
  const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value), []);

  const nameError = touched.name ? getFieldError(name, nameRules, language) : null;
  const emailError = touched.email ? getFieldError(email, emailRules, language) : null;

  const passwordRules = useMemo(() => getPasswordRules(password), [password]);
  const isPasswordValid = useMemo(() => passwordRules.every((r) => r.met), [passwordRules]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    const currentNameError = getFieldError(name, nameRules, language);
    const currentEmailError = getFieldError(email, emailRules, language);
    if (currentNameError || currentEmailError) return;

    if (!isPasswordValid) {
      toast({
        title: language === 'en' ? 'Error' : 'Greška',
        description: language === 'en'
          ? 'Password does not meet all requirements'
          : 'Lozinka ne ispunjava sve zahteve',
        variant: 'destructive',
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: language === 'en' ? 'Error' : 'Greška',
        description: language === 'en'
          ? 'Passwords do not match'
          : 'Lozinke se ne poklapaju',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await createCustomer({ email, password, name });
      toast({
        title: language === 'en' ? 'Registration Successful' : 'Uspešna registracija',
        description: language === 'en'
          ? 'Your account has been created!'
          : 'Vaš nalog je kreiran!',
      });
      onSuccess();
    } catch (error: any) {
      console.error('Registration Error:', error);
      let errorMessage = language === 'en' ? 'Failed to create account. Please try again.' : 'Kreiranje naloga nije uspelo. Pokušajte ponovo.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = language === 'en' ? 'Email is already in use.' : 'E-pošta se već koristi.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = language === 'en' ? 'Password is too weak.' : 'Lozinka je preslaba.';
      }
      toast({
        title: language === 'en' ? 'Registration Failed' : 'Registracija neuspešna',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [name, email, password, confirmPassword, language, isPasswordValid, onSuccess]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <FormField
        id="registerName"
        label={language === 'en' ? 'Full Name' : 'Ime i Prezime'}
        value={name}
        onChange={handleNameChange}
        onBlur={() => markTouched('name')}
        error={nameError}
      />
      <FormField
        id="registerEmail"
        type="email"
        label={language === 'en' ? 'Email' : 'E-pošta'}
        placeholder="you@example.com"
        value={email}
        onChange={handleEmailChange}
        onBlur={() => markTouched('email')}
        error={emailError}
      />
      <FormField
        id="registerPassword"
        type="password"
        label={language === 'en' ? 'Password' : 'Lozinka'}
        value={password}
        onChange={handlePasswordChange}
      >
        {password.length > 0 && (
          <PasswordValidation password={password} language={language as 'en' | 'sr'} />
        )}
      </FormField>
      <FormField
        id="registerConfirmPassword"
        type="password"
        label={language === 'en' ? 'Confirm Password' : 'Potvrdite Lozinku'}
        value={confirmPassword}
        onChange={handleConfirmPasswordChange}
      >
        {confirmPassword.length > 0 && (
          <p className={`flex items-center gap-2 text-xs mt-1 ${password === confirmPassword ? 'text-green-600' : 'text-destructive'}`}>
            {password === confirmPassword
              ? <><Check className="w-3 h-3" />{language === 'en' ? 'Passwords match' : 'Lozinke se poklapaju'}</>
              : <><X className="w-3 h-3" />{language === 'en' ? 'Passwords do not match' : 'Lozinke se ne poklapaju'}</>
            }
          </p>
        )}
      </FormField>
      <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-burgundy-dark">
        {isLoading
          ? (language === 'en' ? 'Creating Account...' : 'Kreiranje Naloga...')
          : (language === 'en' ? 'Create Account' : 'Kreiraj Nalog')}
      </Button>
    </form>
  );
});

RegisterForm.displayName = 'RegisterForm';

// --- Main Dialog ---

interface AuthDialogProps {
  defaultTab?: 'login' | 'register';
  triggerLabel?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

const AuthDialog = ({
  defaultTab = 'login',
  triggerLabel,
  variant = 'default',
  size = 'sm',
  className,
  children
}: AuthDialogProps) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [linkingData, setLinkingData] = useState<{ email: string; credential: any } | null>(null);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setTimeout(() => setLinkingData(null), 200); // Clear linking data after close animation
    }
  }, []);

  const handleSuccess = useCallback(() => {
    setIsOpen(false);
    setLinkingData(null);
  }, []);

  const handleLinkingRequired = useCallback((email: string, credential: any) => {
    setLinkingData({ email, credential });
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant={variant} size={size} className={className}>
            {triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {language === 'en' ? 'Welcome to SFINK' : 'Dobrodošli u SFINK'}
          </DialogTitle>
          <DialogDescription>
            {language === 'en'
              ? 'Sign in to place bids and track your auctions'
              : 'Prijavite se da biste postavili ponude i pratili aukcije'}
          </DialogDescription>
        </DialogHeader>

        {linkingData ? (
          <div className="mt-4">
            <LinkAccountForm
              language={language as 'en' | 'sr'}
              email={linkingData.email}
              credential={linkingData.credential}
              onSuccess={handleSuccess}
              onCancel={() => setLinkingData(null)}
            />
          </div>
        ) : (
          <Tabs defaultValue={defaultTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">
                {language === 'en' ? 'Login' : 'Prijava'}
              </TabsTrigger>
              <TabsTrigger value="register">
                {language === 'en' ? 'Register' : 'Registracija'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-4">
              <LoginForm language={language as 'en' | 'sr'} onSuccess={handleSuccess} />
              <Divider language={language as 'en' | 'sr'} />
              <SocialAuthButton
                language={language as 'en' | 'sr'}
                onSuccess={handleSuccess}
                onLinkingRequired={handleLinkingRequired}
              />
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-4">
              <RegisterForm language={language as 'en' | 'sr'} onSuccess={handleSuccess} />
              <Divider language={language as 'en' | 'sr'} />
              <SocialAuthButton
                language={language as 'en' | 'sr'}
                onSuccess={handleSuccess}
                onLinkingRequired={handleLinkingRequired}
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
