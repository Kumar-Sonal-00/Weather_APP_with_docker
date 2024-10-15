import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
 
@Injectable({
  providedIn: 'root',
})

export class WeatherForcastService {
  // private apiKey = 'f22c5bc01b9b98e59c8c6a9bb364100d';
  // private geocodeUrl = 'http://api.openweathermap.org/geo/1.0/direct';
  // private weatherUrl = 'https://api.openweathermap.org/data/2.5/weather';

  private apiGatewayUrl = 'http://localhost:22769/api/Weather';
 
  // Array to hold favorite cities
  private favoriteCities: string[] = [];
 
  constructor(private http: HttpClient) {}

  setCity(cities: string[]): void {
    this.favoriteCities = cities;
  }
 
  // Get city coordinates using Geocoding API
  getCityCoordinates(city: string): Observable<any> {
    //const url = `${this.geocodeUrl}?q=${city}&limit=1&appid=${this.apiKey}`;
    const url = `${this.apiGatewayUrl}/${city}/geocoding`;
    return this.http.get(url).pipe(
      map((data: any) => {
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          return { lat, lon };
        } else {
          throw new Error('City not found');
        }
      }),
      catchError((error) => {
        console.error('City not found', error);
        return throwError(() => new Error('City not found'));
      })
    );
  }
 
  getWeatherByCity(city: string): Observable<any> {
    if (!city) {
      console.error('City is undefined or empty');
      return throwError(() => new Error('City cannot be undefined or empty'));
  }
  
  const url = `${this.apiGatewayUrl}/${city}`;
  return this.http.get(url).pipe(
      catchError((error) => {
          console.error('Error getting weather by city', error);
          return throwError(() => new Error('City not found'));
      })
    );
  }
}