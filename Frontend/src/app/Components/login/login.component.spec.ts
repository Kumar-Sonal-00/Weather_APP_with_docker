import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../Services/auth.service';
import { UserService } from '../../Services/user.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    // Create spies for the services
    const userServiceSpy = jasmine.createSpyObj('UserService', ['loginUser']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['setLogin']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [FormsModule, CommonModule, HttpClientModule, LoginComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate email correctly', () => {
    expect(component.isValidEmail('test@example.com')).toBeTrue();
    expect(component.isValidEmail('invalid-email')).toBeFalse();
  });

  it('should not allow login if fields are missing', () => {
    component.loginObj.email = '';
    component.loginObj.password = '';

    component.onLogin();

    expect(snackBar.open).toHaveBeenCalledWith(
      'All fields are mandatory.',
      'Close',
      {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      }
    );
  });

  it('should not allow login if email is invalid', () => {
    component.loginObj.email = 'invalid-email';
    component.loginObj.password = 'password';

    component.onLogin();

    expect(snackBar.open).toHaveBeenCalledWith(
      'Please enter a valid email address.',
      'Close',
      {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      }
    );
  });

  it('should login successfully and redirect to profile', () => {
    const mockResponse = { token: 'dummy-token' };
    userService.loginUser.and.returnValue(of(mockResponse));

    component.loginObj.email = 'test@example.com';
    component.loginObj.password = 'password';
    component.onLogin();

    expect(userService.loginUser).toHaveBeenCalledWith(component.loginObj);
    expect(authService.setLogin).toHaveBeenCalledWith(
      component.loginObj.email,
      mockResponse.token
    );
    expect(snackBar.open).toHaveBeenCalledWith('Login Successful', 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/profile');
  });

  it('should display error if login fails with 401 (Invalid credentials)', () => {
    userService.loginUser.and.returnValue(throwError({ status: 401 }));

    component.loginObj.email = 'test@example.com';
    component.loginObj.password = 'wrong-password';
    component.onLogin();

    expect(snackBar.open).toHaveBeenCalledWith(
      'Invalid credentials. Please check your email and password.',
      'Close',
      {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      }
    );
  });

  it('should display error if login fails with 404 (User not found)', () => {
    userService.loginUser.and.returnValue(throwError({ status: 404 }));

    component.loginObj.email = 'nonexistent@example.com';
    component.loginObj.password = 'password';
    component.onLogin();

    expect(snackBar.open).toHaveBeenCalledWith(
      'User does not exist. Please register first.',
      'Close',
      {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      }
    );
  });

  it('should display generic error for other errors during login', () => {
    userService.loginUser.and.returnValue(throwError({ status: 500 }));

    component.loginObj.email = 'test@example.com';
    component.loginObj.password = 'password';
    component.onLogin();

    expect(snackBar.open).toHaveBeenCalledWith(
      'An error occurred during login. Please try again.',
      'Close',
      {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      }
    );
  });

  it('should toggle password visibility', () => {
    expect(component.passwordVisible).toBeFalse();
    component.togglePasswordVisibility();
    expect(component.passwordVisible).toBeTrue();
    component.togglePasswordVisibility();
    expect(component.passwordVisible).toBeFalse();
  });

  it('should toggle confirm password visibility', () => {
    expect(component.confirmPasswordVisible).toBeFalse();
    component.toggleConfirmPasswordVisibility();
    expect(component.confirmPasswordVisible).toBeTrue();
    component.toggleConfirmPasswordVisibility();
    expect(component.confirmPasswordVisible).toBeFalse();
  });
});
