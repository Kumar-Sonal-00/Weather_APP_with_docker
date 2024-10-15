import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const mockResponse = { token: 'fake-jwt-token' };
  const apiUrl = 'http://localhost:5086/api/Auth/Login';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should log in a user and store token', () => {
    const credentials = { email: 'test@example.com', password: 'password' };
  
    service.loginUser(credentials).subscribe((response) => {
      // Manually call setLogin once you receive the response.
      service.setLogin(credentials.email, response.token);
    });
  
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);  // Simulate a successful response from the backend
  
    // After calling setLogin, check the localStorage values
    expect(localStorage.getItem('token')).toBe('fake-jwt-token');
    expect(localStorage.getItem('email')).toBe('test@example.com');
  });
  
  it('should log out a user and clear token', () => {
    localStorage.setItem('token', 'fake-jwt-token');
    localStorage.setItem('email', 'test@example.com');

    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('email')).toBeNull();
  });

  it('should return login status', () => {
    service.isLoggedIn.next(true); // Directly set the BehaviorSubject to true
    expect(service.isUserLoggedIn()).toBeTrue();
    
    service.isLoggedIn.next(false); // Set it to false
    expect(service.isUserLoggedIn()).toBeFalse();
  });
}); 