import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../Services/user.service';
import { AuthService } from '../../Services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {

  loginObj: any = {
    phone: '',
    email:'',
    password: '',
    username:''
  };

  constructor(private router: Router, private userService:UserService,private authService:AuthService,  private snackBar: MatSnackBar ) {}
  reset() {
    this.loginObj = {
      email: '',
      password: ''
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

  onLogin() {

    // Convert email to lowercase for case-insensitive comparison
    const email = this.loginObj.email.toLowerCase();
    this.loginObj.email = email;
     
    //Validate all fields should be not null
    if (!this.loginObj.password || !this.loginObj.email) {
      
      this.openSnackBar('All fields are mandatory.');
      return; // Exit the method if the any field is empty
    }

    // Validate email before proceeding with the login
    if (!this.isValidEmail(this.loginObj.email)) {
      this.openSnackBar('Please enter a valid email address.');
      return; // Exit the method if the email is invalid
    }
    
    this.userService.loginUser(this.loginObj).subscribe({
      next: (response: any) => {
        if (response && response.token) {
          this.authService.setLogin(this.loginObj.email, response.token);
          this.openSnackBar('Login Successful');
          this.router.navigateByUrl('/profile');
        } else {
          // This branch is not be needed if the backend handles invalid credentials
          this.openSnackBar('Login failed, invalid credentials');
        }
      },
      error: (err) => {
        console.error('Error during login', err);
        
        // Check the error status or message to provide specific feedback
        if (err.status === 401) {
          this.openSnackBar('Invalid credentials. Please check your email and password.');
        } else if (err.status === 404) {
          this.openSnackBar('User does not exist. Please register first.');
        } else {
          this.openSnackBar('An error occurred during login. Please try again.');
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