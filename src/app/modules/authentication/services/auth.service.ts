import { Observable } from 'rxjs';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { IdentityProvider } from './identity-provider.service';
import { ColidAccount } from '../models/colid-account.model';
import { Injectable, Inject } from '@angular/core';
import { IDENT_PROV } from '../../../shared/constants';
import { RolePermissions } from '../role-permissions';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _currentUserEmailAddress: string | null;
  get currentUserEmailAddress() {
    return this._currentUserEmailAddress;
  }
  constructor(
    @Inject(IDENT_PROV) private identityProvider: IdentityProvider,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  get currentIdentity$(): Observable<ColidAccount | null> {
    return this.identityProvider
      .getAccount()
      .pipe(
        tap(
          (account: ColidAccount) =>
            (this._currentUserEmailAddress = account?.email ?? null)
        )
      );
  }

  get currentEmail$(): Observable<string | null> {
    return this.currentIdentity$.pipe(map((id) => (id ? id.email : null)));
  }

  get currentName$(): Observable<string | null> {
    return this.currentIdentity$.pipe(map((id) => (id ? id.name : null)));
  }

  get currentUserId$(): Observable<string | null> {
    return this.currentIdentity$.pipe(
      map((id) => (id ? id.accountIdentifier : null))
    );
  }

  get isLoggedIn$(): Observable<boolean> {
    return this.identityProvider.isLoggedIn$;
  }

  get loginInProgress(): boolean {
    return this.identityProvider.loginInProgress();
  }

  get currentUserRoles$(): Observable<any> {
    return this.currentIdentity$.pipe(map((id) => (id ? id.roles : [])));
  }

  get hasSuperAdminPrivilege$(): Observable<boolean> {
    return this.hasPrivileges(RolePermissions.SuperAdmin);
  }

  get hasAdminPrivilege$(): Observable<boolean> {
    return this.hasPrivileges(RolePermissions.Admin);
  }

  private hasPrivileges(rolePermissions: string[]): Observable<boolean> {
    return this.currentUserRoles$.pipe(
      map((roles) => {
        if (roles == undefined) {
          return false;
        }
        if (roles.length > 0) {
          return roles.some((role) => rolePermissions.includes(role));
        } else {
          return false;
        }
      })
    );
  }

  get isLoadingUser(): boolean {
    return false;
  }

  get accessToken(): string | null {
    return localStorage.getItem('msal.idtoken');
  }

  subscribeCheckAccount() {
    // val is on startup of the application null, in this case we do nothing
    return this.isLoggedIn$.pipe(distinctUntilChanged()).subscribe((val) => {
      console.log('Subscribe check account', val, this.loginInProgress);
      if (val === false) {
        console.log('Login ready');
        this.login();
      } else if (val === true) {
        console.log('Redirecting');
        this.redirect();
      }
    });
  }

  redirect() {
    const redirectPathString = window.sessionStorage.getItem('url');
    const queryParamString = window.sessionStorage.getItem('queryParams');

    if (redirectPathString == null || queryParamString == null) {
      this.router.navigate(['']);
      return;
    }

    const redirectPath = JSON.parse(redirectPathString);
    const queryParams = JSON.parse(queryParamString);

    this.router.navigate(redirectPath, { queryParams: queryParams });
  }

  login() {
    this.identityProvider.login();
  }

  logout() {
    this.identityProvider.logout();
  }

  cleanup() {
    this.identityProvider.cleanup();
  }
}
