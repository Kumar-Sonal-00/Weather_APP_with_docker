import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WeatherForecastComponent } from './weather-forcasting.component';
import { WeatherForcastService } from '../../Services/weather-forcast.service';
import { AuthService } from '../../Services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('WeatherForecastComponent', () => {
  let component: WeatherForecastComponent;
  let fixture: ComponentFixture<WeatherForecastComponent>;
  let weatherService: jasmine.SpyObj<WeatherForcastService>;
  let authService: jasmine.SpyObj<AuthService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    weatherService = jasmine.createSpyObj('WeatherForcastService', ['getWeather']);
    
    // Mocking AuthService with the necessary methods
    authService = jasmine.createSpyObj('AuthService', ['user', 'getCurrentUserEmail', 'isUserLoggedIn']);
    // Assuming getCurrentUserEmail returns an email
    authService.getCurrentUserEmail.and.returnValue('test@example.com');
    // Mocking the user observable
    authService.user = of({ email: 'test@example.com' });

    // Mocking isUserLoggedIn
    authService.isUserLoggedIn.and.returnValue(true); // Set to true or false as needed in tests

    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, WeatherForecastComponent],
      declarations: [],
      providers: [
        { provide: WeatherForcastService, useValue: weatherService },
        { provide: AuthService, useValue: authService },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WeatherForecastComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should refresh weather data', () => {
    spyOn(component, 'searchWeather'); // Spy on the searchWeather method
    component.refreshWeather(); // Call refresh method
    expect(component.searchWeather).toHaveBeenCalled(); // Verify searchWeather was called
  });

  it('should add city to favorites if user is logged in', () => {
    authService.isUserLoggedIn.and.returnValue(true); // Mock user login status
    authService.getCurrentUserEmail.and.returnValue('test@example.com'); // Mock user email

    const city = 'London';
    component.addToFavorites(city, 'test@example.com'); // Call the addToFavorites method
  });
});