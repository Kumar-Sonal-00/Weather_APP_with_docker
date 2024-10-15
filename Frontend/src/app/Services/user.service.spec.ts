import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const mockUserData = {
    name: 'Test User',
    email: 'test@example.com',
    password: '123456',
  };

  const mockLoginData = {
    email: 'test@example.com',
    password: '123456',
  };

  const mockRegisterResponse = {
    message: 'User registered successfully',
  };

  const mockLoginResponse = {
    token: 'mock-jwt-token',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifies that no unmatched requests are outstanding
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send POST request to register a user', () => {
    service.registerUser(mockUserData).subscribe((response) => {
      expect(response).toEqual(mockRegisterResponse);
    });

    const req = httpMock.expectOne('http://localhost:5200/api/User');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockUserData);

    req.flush(mockRegisterResponse); // Simulate server response
  });

  it('should send POST request to login a user', () => {
    service.loginUser(mockLoginData).subscribe((response) => {
      expect(response).toEqual(mockLoginResponse);
    });

    const req = httpMock.expectOne('http://localhost:5086/api/Auth/Login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockLoginData);

    req.flush(mockLoginResponse); // Simulate server response
  });
});