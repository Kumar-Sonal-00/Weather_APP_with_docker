import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthService } from '../../Services/auth.service';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'isUserLoggedIn',
      'getCurrentUserEmail',
      'logout',
      'user',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Mocking initial states
    authService.getCurrentUserEmail.and.returnValue('test@example.com');
    authService.isUserLoggedIn.and.returnValue(true);
    authService.user = of(true); // Simulating logged-in state

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should fetch logged-in user's email in constructor", () => {
    expect(component.userEmail).toBe('test@example.com');
  });
  
  it('should subscribe to user auth status on init', () => {
    spyOn(authService.user, 'subscribe'); // Spy on the subscribe method
    component.ngOnInit(); // Call ngOnInit
    expect(authService.user.subscribe).toHaveBeenCalled(); // Ensure subscription is set up
  });

  it('should unsubscribe from user auth status on destroy', () => {
    // Initialize dataSource with a mock subscription object
    const unsubscribeSpy = jasmine.createSpy('unsubscribe');
    component.dataSource = { unsubscribe: unsubscribeSpy } as any; // Type assertion for testing purposes

    component.ngOnDestroy(); // Call ngOnDestroy
    expect(unsubscribeSpy).toHaveBeenCalled(); // Ensure unsubscribe is called
  });

  it('should update userEmail if user is logged in', fakeAsync(() => {
    authService.user = of(true); // Simulate logged-in state
    component.ngOnInit(); // Call ngOnInit
    tick(); // Simulate passage of time
    expect(component.userEmail).toBe('test@example.com'); // Validate userEmail is updated
  }));

  it('should logout and navigate to home', () => {
    component.logout(); // Call logout
    expect(authService.logout).toHaveBeenCalled(); // Check logout call
    expect(router.navigate).toHaveBeenCalledWith(['/']); // Check navigation to home
  });
});