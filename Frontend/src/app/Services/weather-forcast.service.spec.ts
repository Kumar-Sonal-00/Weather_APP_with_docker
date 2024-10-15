import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { WeatherForcastService } from './weather-forcast.service';

describe('WeatherForcastService', () => {
  let service: WeatherForcastService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Import the HttpClientTestingModule
      providers: [WeatherForcastService], // Provide the service
    });
    service = TestBed.inject(WeatherForcastService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify(); // Verify that there are no outstanding requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch city coordinates successfully', () => {
    const mockCityCoordinates = [{ lat: 51.5074, lon: -0.1278 }];
    const cityName = 'London';

    service.getCityCoordinates(cityName).subscribe((data) => {
      expect(data).toEqual({ lat: 51.5074, lon: -0.1278 });
    });

    const req = httpTestingController.expectOne(
      `http://localhost:22769/api/Weather/${cityName}/geocoding`
    );
    expect(req.request.method).toEqual('GET');
    req.flush(mockCityCoordinates); // Respond with mock coordinates
  });

  it('should handle error when fetching city coordinates', () => {
    const cityName = 'UnknownCity';

    service.getCityCoordinates(cityName).subscribe(
      () => fail('expected an error, not coordinates'),
      (error: Error) => {
        expect(error.message).toEqual('City not found');
      }
    );

    const req = httpTestingController.expectOne(
      `http://localhost:22769/api/Weather/${cityName}/geocoding`
    );
    expect(req.request.method).toEqual('GET');
    req.flush([], { status: 404, statusText: 'Not Found' }); // Simulate a 404 error
  });

  it('should fetch weather data by city successfully', () => {
    const mockWeatherData = {
      name: 'London',
      main: { temp: 15, humidity: 80, pressure: 1012 },
      weather: [{ description: 'Clear sky', icon: '01d' }],
      wind: { speed: 5 },
    };
    const cityName = 'London';

    service.getWeatherByCity(cityName).subscribe((data) => {
      expect(data).toEqual(mockWeatherData);
    });

    const req = httpTestingController.expectOne(
      `http://localhost:22769/api/Weather/${cityName}`
    );
    expect(req.request.method).toEqual('GET');
    req.flush(mockWeatherData); // Respond with mock weather data
  });

  it('should handle error when fetching weather data by city', () => {
    const cityName = 'UnknownCity';

    service.getWeatherByCity(cityName).subscribe(
      () => fail('expected an error, not weather data'),
      (error: Error) => {
        expect(error.message).toEqual('City not found');
      }
    );

    const req = httpTestingController.expectOne(
      `http://localhost:22769/api/Weather/${cityName}`
    );
    expect(req.request.method).toEqual('GET');
    req.flush(
      { message: 'City not found' },
      { status: 404, statusText: 'Not Found' }
    ); // Simulate a 404 error
  });

  it('should throw an error if city is undefined or empty', () => {
    service.getWeatherByCity('').subscribe(
      () => fail('expected an error, not weather data'),
      (error: Error) => {
        expect(error.message).toEqual('City cannot be undefined or empty');
      }
    );
  });

  it('should handle invalid city coordinates response', () => {
    const cityName = 'InvalidCity';

    service.getCityCoordinates(cityName).subscribe(
      () => fail('expected an error, not coordinates'),
      (error: Error) => {
        expect(error.message).toEqual('City not found');
      }
    );

    const req = httpTestingController.expectOne(
      `http://localhost:22769/api/Weather/${cityName}/geocoding`
    );
    expect(req.request.method).toEqual('GET');
    req.flush([]); // Simulate an invalid response (empty array)
  });
});
