import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './Services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const isLoggedIn = !!localStorage.getItem('isLoggedIn'); // Check if user is logged in

  // Check if the token is valid
  if (isLoggedIn) {
    const token = localStorage.getItem('token');
    if (token) {
      // logic to verify the token 
      const isTokenValid = verifyToken(token); // Implement this function
      if (isTokenValid) {
        return true; // Allow access to the route
      }
    }
  }

  alert('You must be logged in.');
  router.navigate(['/login']); // Redirect to login if token is expired or user is not logged in
  return false; 
};

function verifyToken(token: string): boolean {
  // For example, check the token expiration
  const payload = JSON.parse(atob(token.split('.')[1])); // Decode the token
  const expiry = payload.exp * 1000; // Convert to milliseconds
  return Date.now() < expiry; // Check if token is not expired
}