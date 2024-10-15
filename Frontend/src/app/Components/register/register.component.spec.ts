import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UserService } from '../../Services/user.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj('UserService', [
      'registerUser',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule, // Mocking HttpClient
        RegisterComponent,
      ],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle password visibility', () => {
    expect(component.passwordVisible).toBeFalse();
    component.togglePasswordVisibility();
    expect(component.passwordVisible).toBeTrue();
  });

  it('should toggle confirm password visibility', () => {
    expect(component.confirmPasswordVisible).toBeFalse();
    component.toggleConfirmPasswordVisibility();
    expect(component.confirmPasswordVisible).toBeTrue();
  });

  it('should validate email format', () => {
    const validEmail = 'test@example.com';
    const invalidEmail = 'invalid-email';

    expect(component.isValidEmail(validEmail)).toBeTrue();
    expect(component.isValidEmail(invalidEmail)).toBeFalse();
  });

  it('should show snack bar if any field is missing', () => {
    component.registerObj = {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    };
    component.onRegister();
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

  it('should show snack bar if email is invalid', () => {
    component.registerObj = {
      fullName: 'Test',
      email: 'invalid-email',
      password: 'password',
      confirmPassword: 'password',
    };
    component.onRegister();
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

  it('should show snack bar if passwords do not match', () => {
    component.registerObj = {
      fullName: 'Test',
      email: 'test@example.com',
      password: 'password',
      confirmPassword: 'wrong-password',
    };
    component.onRegister();
    expect(snackBar.open).toHaveBeenCalledWith(
      'Passwords do not match. Please try again.',
      'Close',
      {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      }
    );
  });

  it('should register user successfully and navigate to login', () => {
    component.registerObj = {
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password',
      confirmPassword: 'password',
    };

    // Mock the service call
    userService.registerUser.and.returnValue(of({ message: 'Success' }));

    component.onRegister();

    expect(snackBar.open).toHaveBeenCalledWith('Sign up successful.', 'Close', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('should handle 400 error for invalid input', () => {
    component.registerObj = {
      fullName: 'Test',
      email: 'test@example.com',
      password: 'password',
      confirmPassword: 'password',
    };

    // Mock the service call to return an error
    userService.registerUser.and.returnValue(throwError({ status: 400 }));

    component.onRegister();

    expect(snackBar.open).toHaveBeenCalledWith(
      'Please check your input and try again.',
      'Close',
      {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      }
    );
  });

  it('should handle 409 error for user already exists', () => {
    component.registerObj = {
      fullName: 'Test',
      email: 'test@example.com',
      password: 'password',
      confirmPassword: 'password',
    };

    // Mock the service call to return a conflict error
    userService.registerUser.and.returnValue(throwError({ status: 409 }));

    component.onRegister();

    expect(snackBar.open).toHaveBeenCalledWith(
      'User already exists. Please log in.',
      'Close',
      {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      }
    );
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('should handle unexpected errors', () => {
    component.registerObj = {
      fullName: 'Test',
      email: 'test@example.com',
      password: 'password',
      confirmPassword: 'password',
    };

    // Mock the service call to return an unexpected error
    userService.registerUser.and.returnValue(throwError({ status: 500 }));

    component.onRegister();

    expect(snackBar.open).toHaveBeenCalledWith(
      'An unexpected error occurred. Please try again.',
      'Close',
      {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      }
    );
  });
});
