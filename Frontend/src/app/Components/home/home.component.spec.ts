import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AuthService } from '../../Services/auth.service';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let router: Router;
  let authService: AuthService;

  beforeEach(async () => {
    const routerMock = {
      navigate: jasmine.createSpy('navigate'),
    };

    // Create a BehaviorSubject to simulate the user authentication state
    const userSubject = new BehaviorSubject<boolean>(false); // Initial value: false

    const authServiceMock = {
      user: userSubject.asObservable(), // Return the observable from BehaviorSubject
      isUserLoggedIn: jasmine
        .createSpy('isUserLoggedIn')
        .and.callFake(() => userSubject.value),
      getCurrentUserEmail: jasmine
        .createSpy('getCurrentUserEmail')
        .and.callFake(() => (userSubject.value ? 'test@example.com' : null)),
      logout: jasmine.createSpy('logout'),
    };

    await TestBed.configureTestingModule({
      // Use imports instead of declarations since it's a standalone component
      imports: [HomeComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it('should create the home component', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to authService.user on ngOnInit', () => {
    // Mock the subscribe method
    spyOn(authService.user, 'subscribe').and.callThrough();

    component.ngOnInit();

    expect(authService.user.subscribe).toHaveBeenCalled();
  });

  it('should unsubscribe from authService.user on ngOnDestroy', () => {
    component.ngOnInit(); // Initialize to set the subscription
    const unsubscribeSpy = spyOn(
      Subscription.prototype,
      'unsubscribe'
    ).and.callThrough(); // Spy on the unsubscribe method

    component.ngOnDestroy();

    expect(unsubscribeSpy).toHaveBeenCalled(); // Ensure unsubscribe is called
  });

  it('should call logout and navigate to home', () => {
    component.logout();
    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});