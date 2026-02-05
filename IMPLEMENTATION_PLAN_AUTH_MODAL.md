# Implementation Plan - AuthModal Integration

The goal is to replace the standalone `/login` and `/registar` pages with the newly ported `AuthModal` system. The modal will be triggered from the Navbar.

## User Requirements
- Ensure AuthModal system is integrated (Completed).
- Keep existing login/registration logic (Completed adaptation in `AuthModal` forms).
- **Critical**: `/login` and `/registar` pages should not exist/be used.
- "Login" and "Register" buttons in Navbar should open the specific modal view.

## Proposed Changes

### 1. Update `AuthModal` Component
- Modify `src/components/auth/AuthModal/index.tsx` to accept an `initialView` prop (`'login' | 'register'`) to allow opening directly to the correct form.

### 2. Update `Navbar` Component (`src/app/components/Navbar.tsx`)
- Import `AuthModal`.
- Add state: `isAuthModalOpen` (boolean) and `authView` ('login' | 'register').
- Replace the `Link` to `/login` with a button (or `a` tag preventing default) that opens the modal.
- Start the modal in 'login' mode.
- (Optional) Add a "Register" button if desired, or rely on the "Don't have an account?" link inside the login modal (standard flow). *Correction*: User said "po kliknieciu na navbarze na Login / Register", implying two buttons or a switch. I will ensure the Login button opens Login mode. If I add a Register button, it opens Register mode.

### 3. Clean up Routes
- Delete `src/app/login/` directory.
- Delete `src/app/registar/` directory.

### 4. Verify & Polish
- Ensure styles match `fabiole` (using `newButton`, `globals.css`).
- check z-index of modal to ensure it appears above everything.

## Verification Plan
1.  Click "Login" in Navbar -> Modal opens showing Login form.
2.  Switch to "Register" inside modal -> Shows Register form.
3.  Verify Login submission calls `useLogin`.
4.  Verify Register submission calls `useRegister`.
5.  Navigate to `/login` -> Should 404 (since we delete it).

