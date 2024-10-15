import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms'; 
import { CommonModule, JsonPipe } from '@angular/common';
import { UserService } from '../../Services/user.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, JsonPipe, CommonModule, HttpClientModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})

export class RegisterComponent {
  registeredData: any;

  registerObj: any = {
    fullName: '',
    email:'',
    password: '',
    confirmPassword:''
  };

  constructor(private fb: FormBuilder, private router: Router, private userService: UserService, private snackBar: MatSnackBar) {
  }
  reset() {
    this.registerObj = {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
  }

  passwordVisible = false; // Flag for password visibility
  confirmPasswordVisible = false; // Flag for confirm password visibility

  // Function to toggle password visibility
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  // Function to toggle confirm password visibility
  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  onRegister() {

    //Validate all fields should be not null
    if (!this.registerObj.password || !this.registerObj.confirmPassword || !this.registerObj.email || !this.registerObj.fullName) {
      this.openSnackBar('All fields are mandatory.');
      return; // Exit the method if the any field is empty
    }

    // Convert email to lowercase for case-insensitive comparison
    const email = this.registerObj.email.toLowerCase();
    this.registerObj.email = email;

    // Validate email before proceeding with the login
    if (!this.isValidEmail(this.registerObj.email)) {
      this.openSnackBar('Please enter a valid email address.');
        return; // Exit the method if the email is invalid
    }

    // Check if password and confirm password match
    if (this.registerObj.password !== this.registerObj.confirmPassword) {
      this.openSnackBar('Passwords do not match. Please try again.');
        return; // Exit if passwords do not match
    }

    // Proceed with registration if form is valid
    this.userService.registerUser(this.registerObj).subscribe({
        next: (response) => {
            this.registeredData = response;
            this.openSnackBar('Sign up successful.');
            this.router.navigateByUrl('/login');
        },
        error: (err) => {
          console.error('Error registering user', err);
          // Display a user-friendly message based on the error status
          if (err.status === 400) {
            this.openSnackBar('Please check your input and try again.');
          } else if (err.status === 409) {
            this.openSnackBar('User already exists. Please log in.');
              this.router.navigateByUrl('/login');
          } else {
            this.openSnackBar('An unexpected error occurred. Please try again.');
          }
        }
    });
  }

  private openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000, // Duration in milliseconds
      verticalPosition: 'top', // Adjust position as needed
      horizontalPosition: 'center', // Adjust position as needed
    });
  }
}