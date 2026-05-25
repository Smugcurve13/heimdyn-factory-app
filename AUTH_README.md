# Authentication System

This application now uses a simple custom authentication system instead of Clerk.

## Components

### AuthProvider (`components/AuthProvider.tsx`)
- Provides authentication context throughout the app
- Manages user state in localStorage (replace with your backend)
- Includes `SignedIn` and `SignedOut` components for conditional rendering

### AuthModal (`components/AuthModal.tsx`)
- Modal dialog for sign-in and sign-up
- Includes form validation and loading states
- Can be configured for either sign-in or sign-up mode

### UserButton (`components/UserButton.tsx`)
- User avatar dropdown with sign-out functionality
- Shows user initials and email
- Replaces Clerk's UserButton

## Usage

The authentication system provides the same components as Clerk:

```tsx
import { useAuth, SignedIn, SignedOut } from '@/components/AuthProvider';
import { AuthModal } from '@/components/AuthModal';
import { UserButton } from '@/components/UserButton';

// In components:
const { user, isSignedIn, signIn, signOut } = useAuth();

// Conditional rendering:
<SignedIn>
  <UserButton />
</SignedIn>
<SignedOut>
  <AuthModal mode="signin">
    <Button>Sign In</Button>
  </AuthModal>
</SignedOut>
```

## Customization

- Replace the mock authentication in `AuthProvider.tsx` with your actual backend API
- Customize the UI components in `AuthModal.tsx` and `UserButton.tsx`
- Add additional user fields as needed in the `User` interface

## Security Note

The current implementation stores user data in localStorage for demo purposes. In production, you should:
- Use secure HTTP-only cookies for session management
- Implement proper JWT token handling
- Add proper authentication backend
- Add CSRF protection
- Implement proper password hashing