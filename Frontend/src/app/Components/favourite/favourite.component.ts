import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { FavouriteService } from '../../Services/favourite.service';
import { WeatherForcastService } from '../../Services/weather-forcast.service';
import { AuthService } from '../../Services/auth.service';
import { Subscription } from 'rxjs';
import { HeaderComponent } from "../header/header.component";


@Component({
  selector: 'app-favourite',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatButtonModule,
    MatCardModule,
    FormsModule,
    HttpClientModule,
    HeaderComponent,
  
],
  templateUrl: './favourite.component.html',
  styleUrls: ['./favourite.component.css'],
})

export class FavouriteComponent implements OnInit, OnDestroy {
  favoriteCities: string[] = [];
  weatherDataMap: { [key: string]: any } = {}; // To store weather data for each city
  dataSource?: Subscription;
  isLoggedIn: boolean = false;
  email: string | null = '';

  constructor(
    private weatherService: WeatherForcastService,
    private favService: FavouriteService,
    private authService: AuthService
   
  ) {}

  ngOnInit(): void {
    this.dataSource = this.authService.user.subscribe((isLoggedIn: boolean) => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.email = this.authService.getCurrentUserEmail();
      }
    });
    if (this.email) {
      this.getFavoriteCities(this.email);
    }
  }

  ngOnDestroy(): void {
    if (this.dataSource) {
      this.dataSource.unsubscribe();
    }
  }

  getFavoriteCities(email: string): void {
    this.favService.getFavorites(email).subscribe(
      (favoriteCities: any[]) => {
        this.favoriteCities = favoriteCities.map((fav) => fav.city);
        this.loadWeatherData(); // Fetch weather data for favorite cities
      },
      (error) => {
        console.error('Failed to fetch favorite cities:', error);
      }
    );
  }

  loadWeatherData(): void {
    this.favoriteCities.forEach((city) => {
        this.weatherService.getWeatherByCity(city).subscribe(
            (data) => {

                this.weatherDataMap[city] = {
                    cityName: data.name,
                    weatherDescription: data.weather[0].description,
                    weatherIcon: `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
                    temperature: data.main.temp,
                    humidity: data.main.humidity,
                    windSpeed: data.wind.speed,
                    pressure: data.main.pressure,
                };
                console.log(this.weatherDataMap);
            },
            (error) => {
                console.error(`Error fetching weather data for city ${city}:`, error);
            }
        );
    });
  }

  removeCity(city: string): void {
    if (this.email) {
      // Confirmation dialog
      const confirmRemoval = confirm(`Are you sure you want to remove ${city} from your favorites?`);
      if (confirmRemoval) {
        // Proceed with removal
        this.favService.removeFromFavorites(city, this.email); 
        this.favoriteCities = this.favoriteCities.filter((c) => c !== city); // Update the list locally
        delete this.weatherDataMap[city]; // Remove from weather data map
      }
    } else {
      alert('You need to log in to remove favorites.');
    }
  }
}