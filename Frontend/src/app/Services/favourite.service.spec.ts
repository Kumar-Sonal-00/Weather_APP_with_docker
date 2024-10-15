import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FavouriteService } from './favourite.service';

describe('FavouriteService', () => {
  let service: FavouriteService;
  let httpMock: HttpTestingController;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    const snackBarSpyObj = jasmine.createSpyObj('MatSnackBar', ['open']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatSnackBarModule], // Include MatSnackBarModule for snackbar testing
      providers: [
        FavouriteService,
        { provide: MatSnackBar, useValue: snackBarSpyObj },
      ],
    });

    service = TestBed.inject(FavouriteService);
    httpMock = TestBed.inject(HttpTestingController);
    snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding requests after each test
  });

  it('should remove a city from favorites', () => {
    const email = 'test@example.com';
    const city = 'New York';
    const mockFavorites = [
      { id: 1, city: 'New York' },
      { id: 2, city: 'Los Angeles' },
    ];

    // Call the removeFromFavorites function
    service.removeFromFavorites(city, email);

    // Mocking the GET request to return the mockFavorites
    const getReq = httpMock.expectOne(`${service['baseUrl']}/${email}`);
    expect(getReq.request.method).toBe('GET');
    getReq.flush(mockFavorites); // Return the mocked favorites list

    // Mocking the DELETE request for the city to be removed
    const deleteReq = httpMock.expectOne(`${service['baseUrl']}/1`); // ID of New York is 1
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush({}); // Simulate successful deletion

    // Ensure there are no other HTTP requests outstanding
    httpMock.verify();
  });

  it('should alert when trying to remove a non-existing city from favorites', () => {
    const email = 'test@example.com';
    const city = 'NonExistingCity';
    const mockFavorites = [
      { id: 1, city: 'New York' },
      { id: 2, city: 'Los Angeles' },
    ];

    // Call the removeFromFavorites function
    service.removeFromFavorites(city, email);

    // Mocking the GET request to return the mockFavorites
    const getReq = httpMock.expectOne(`${service['baseUrl']}/${email}`);
    expect(getReq.request.method).toBe('GET');
    getReq.flush(mockFavorites); // Return the mocked favorites list

    // Since the city does not exist, no DELETE request should be made
    httpMock.verify(); // Ensure no other HTTP requests were made
  });

  it('should handle errors when getting favorites fails', () => {
    const email = 'test@example.com';
    const city = 'New York';

    // Call the removeFromFavorites function
    service.removeFromFavorites(city, email);

    // Mocking the GET request and returning an error
    const getReq = httpMock.expectOne(`${service['baseUrl']}/${email}`);
    expect(getReq.request.method).toBe('GET');
    getReq.flush('Error fetching favorites', {
      status: 500,
      statusText: 'Server Error',
    });

    // Since the GET request fails, no DELETE request should be made
    httpMock.verify(); // Ensure no other HTTP requests were made
  });

  it('should handle errors when deleting a favorite city fails', () => {
    const email = 'test@example.com';
    const city = 'New York';
    const mockFavorites = [
      { id: 1, city: 'New York' },
      { id: 2, city: 'Los Angeles' },
    ];

    // Call the removeFromFavorites function
    service.removeFromFavorites(city, email);

    // Mocking the GET request to return the mockFavorites
    const getReq = httpMock.expectOne(`${service['baseUrl']}/${email}`);
    expect(getReq.request.method).toBe('GET');
    getReq.flush(mockFavorites); // Return the mocked favorites list

    // Mocking the DELETE request and returning an error
    const deleteReq = httpMock.expectOne(`${service['baseUrl']}/1`); // ID of New York is 1
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush('Error deleting favorite', {
      status: 500,
      statusText: 'Server Error',
    });

    // Ensure there are no other HTTP requests outstanding
    httpMock.verify();
  });

  it('should display a snackbar when a city is removed successfully', () => {
    const email = 'test@example.com';
    const city = 'New York';
    const mockFavorites = [
      { id: 1, city: 'New York' },
      { id: 2, city: 'Los Angeles' },
    ];

    // Call the removeFromFavorites function
    service.removeFromFavorites(city, email);

    // Mocking the GET request to return the mockFavorites
    const getReq = httpMock.expectOne(`${service['baseUrl']}/${email}`);
    expect(getReq.request.method).toBe('GET');
    getReq.flush(mockFavorites); // Return the mocked favorites list

    // Mocking the DELETE request for the city to be removed
    const deleteReq = httpMock.expectOne(`${service['baseUrl']}/1`); // ID of New York is 1
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush({}); // Simulate successful deletion

    // Check that the MatSnackBar.open method was called with the correct message
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'New York has been removed from favorites.',
      'Close',
      jasmine.objectContaining({ duration: 50000 })
    );
  });

  it('should display a snackbar when trying to remove a non-existing city', () => {
    const email = 'test@example.com';
    const city = 'NonExistingCity';
    const mockFavorites = [
      { id: 1, city: 'New York' },
      { id: 2, city: 'Los Angeles' },
    ];

    // Call the removeFromFavorites function
    service.removeFromFavorites(city, email);

    // Mocking the GET request to return the mockFavorites
    const getReq = httpMock.expectOne(`${service['baseUrl']}/${email}`);
    expect(getReq.request.method).toBe('GET');
    getReq.flush(mockFavorites); // Return the mocked favorites list

    // Since the city does not exist, no DELETE request should be made
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'NonExistingCity is not in your favorites!',
      'Close',
      jasmine.objectContaining({ duration: 50000 })
    );
  });
});
