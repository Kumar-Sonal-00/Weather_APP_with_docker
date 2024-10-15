import { Routes } from '@angular/router';
import { LoginComponent } from './Components/login/login.component';
import { RegisterComponent } from './Components/register/register.component';
import { HomeComponent } from './Components/home/home.component';
import { FavouriteComponent } from './Components/favourite/favourite.component';
import { WeatherForecastComponent } from './Components/weather-forcasting/weather-forcasting.component';
import { authGuard } from './auth.guard';

// Define your application's routes
export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent ,title:"Login | Weather App"},
  { path: 'register', component: RegisterComponent ,title:"Register | Weather App"},
  { path: 'home', component: HomeComponent ,title:"Home | Weather App" },
  { path: 'favorites',component: FavouriteComponent,canActivate: [authGuard],title:"Favourites | Weather App"},
  { path: 'weather-forecast', component: WeatherForecastComponent ,title:"Weather Forecast | Weather App"},
  { path: '**', redirectTo: '/home' },
];