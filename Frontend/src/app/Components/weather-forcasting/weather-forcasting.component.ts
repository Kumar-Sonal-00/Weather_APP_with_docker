import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../Services/auth.service';
import { WeatherForcastService } from '../../Services/weather-forcast.service';
import { HeaderComponent } from '../header/header.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-weather-forcasting',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatGridListModule,
    MatFormFieldModule,
    FormsModule,
    HeaderComponent,
  ],
  templateUrl: './weather-forcasting.component.html',
  styleUrl: './weather-forcasting.component.css',
})

export class WeatherForecastComponent {
  searchedCity: string = '';
  weatherData: any; // Store weather data here
  error: string = '';
  callingFromParent: boolean = false;
  isSearched: boolean = false;

  private baseUrl = 'http://localhost:5098/api/favourite';
  email: string = '';

  constructor(private weatherService: WeatherForcastService, private snackBar: MatSnackBar,private http: HttpClient,private authService: AuthService,private router: Router ) {
    // Subscribe to user authentication status to get email
    this.authService.user.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.email = this.authService.getCurrentUserEmail() ?? '';
      }
    });
  }

  onSearch() {
    this.isSearched = true; // Set this to true when the search button is clicked
    this.searchWeather();
  }

  searchWeather(): void {
    this.weatherService.getWeatherByCity(this.searchedCity).subscribe({
      next: (response) => {
        this.weatherData = response; // Store the weather data
        this.error = ''; // Clear any previous errors
      },
      error: () => {
        this.weatherData='';
        this.error = 'City not found';
        // this.snackBar.open(this.error, 'Close', { duration: 5000 });
        this.openSnackBar('City not found!');
      }
    });
  }

  refreshWeather(): void {
    this.searchWeather(); // Call the search method to refresh data
  }

  // Helper method to get the token from localStorage
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Helper method to create headers with Authorization token
  private createHeaders(): HttpHeaders {
  const token = this.getToken();
  return new HttpHeaders({
    Authorization: token ? `Bearer ${token}` : ''
  });
  }

  addToFavorites(city: string, email: string): void {
    
    // Check if the user is logged in
    if (!this.authService.isUserLoggedIn()) {
        alert('You need to log in first!');
        this.router.navigate(['/login']); // Redirect to the login page
        return; // Exit the method
    }

    const headers = this.createHeaders();
    const newFavorite = { city, email }; // Construct the FavouriteItem object

    // Check if the city is already in the user's favorites
    this.http.get<any[]>(`${this.baseUrl}/${email}`, { headers }).subscribe(
        favorites => {
            const cityExists = favorites.some(fav => fav.city === city && fav.email === email);
            if (!cityExists) {
                // POST request to add the new city to favorites
                this.http.post(this.baseUrl, newFavorite, { headers }).subscribe(() => {
                  this.openSnackBar(`${city} has been added to your favourites!`);
                }, (error: any) => {
                    console.error("Error adding favourite: ", error);
                });
            } else {
              this.openSnackBar(`${city} is already in your favourites!`);
            }
        },
        (error: any) => {
            // If the error is 404, we can assume that no favorites exist, so we can proceed to POST.
            if (error.status === 404) {
                // POST request to add the new city to favorites since no favorites exist
                this.http.post(this.baseUrl, newFavorite, { headers }).subscribe(() => {
                  this.openSnackBar (`${city} has been added to your favourites!`);
                }, (postError: any) => {
                    console.error("Error adding favourite: ", postError);
                });
            } else {
                console.error("Error fetching favourites: ", error);
            }
        }
    );
  }

  private openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000, // Duration in milliseconds
      verticalPosition: 'top',
      horizontalPosition: 'center', // Adjust position as needed
    });
  }
}