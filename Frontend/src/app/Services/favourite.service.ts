import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
 
@Injectable({
  providedIn: 'root'
})
export class FavouriteService {
  private baseUrl = 'http://localhost:5098/api/Favourite';
  constructor(private http: HttpClient,private snackBar: MatSnackBar) { }
  //url:string="http://localhost:3000/favourites"

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
   
  getFavorites(email: string): Observable<any[]> {
    const headers = this.createHeaders();
    return this.http.get<any[]>(`${this.baseUrl}/${email}`, { headers });
  }

  // Remove a city from favorites 
  removeFromFavorites(city: string, email: string): void {
    console.log(email, city);
    const headers = this.createHeaders();

    // Check if the city exists in the user's favorites
    this.http.get<any[]>(`${this.baseUrl}/${email}`, { headers }).subscribe(favorites => {
      // Find the favorite city based on the provided city name
      const favorite = favorites.find(fav => fav.city === city);

      if (favorite) {
        const favoriteId = favorite.id; // Get the id of the found favorite city
        console.log("Deleting city with id: ", favoriteId);

        // DELETE request to remove the city from favorites
        this.http.delete(`${this.baseUrl}/${favoriteId}`, { headers }).subscribe(
          () => {
            this.openSnackBar(`${city} has been removed from favorites.`);
          },
          error => {
            this.openSnackBar (`Failed to remove ${city} from favorites: ${error.message}`);
          }
        );
      } else {
        this.openSnackBar(`${city} is not in your favorites!`);
      }
    }, error => {
      this.openSnackBar(`Failed to check if ${city} is in your favorites: ${error.message}`);
    });
  }

  private openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 50000, // Duration in milliseconds
      verticalPosition: 'top',
      horizontalPosition: 'center', // Adjust position as needed
    });
  }
}