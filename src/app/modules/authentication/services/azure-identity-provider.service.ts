import { Injectable, Inject } from '@angular/core';
import { IdentityProvider } from './identity-provider.service';
import { ColidAccount } from '../models/colid-account.model';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { map, takeUntil, filter } from 'rxjs/operators';
import {
  EventMessage,
  EventType,
  InteractionStatus
} from '@azure/msal-browser';

@Injectable({
  providedIn: 'root'
})
export class AzureIdentityProvider implements IdentityProvider {
  loggingIn: boolean = false;
  isLoggedIn$: BehaviorSubject<boolean | null> = new BehaviorSubject<boolean>(
    null
  );
  currentStatus: InteractionStatus = InteractionStatus.None;
  private readonly _destroying$ = new Subject<void>();

  constructor(
    @Inject(MsalService) private msalService: MsalService,
    private broadcastService: MsalBroadcastService
  ) {
    //set local variable when login started
    this.broadcastService.inProgress$
      .pipe(
        filter(
          (status: InteractionStatus) => status === InteractionStatus.Login
        ),
        takeUntil(this._destroying$)
      )
      .subscribe((_) => (this.loggingIn = true));

    //set local variable when login finished
    this.broadcastService.inProgress$
      .pipe(
        filter(
          (status: InteractionStatus) => status === InteractionStatus.None
        ),
        takeUntil(this._destroying$)
      )
      .subscribe((_) => {
        this.loggingIn = false;
        this.checkLoggedIn();
      });

    this.broadcastService.inProgress$.subscribe((r) => {
      console.log('current status', r);
      this.currentStatus = r;
    });

    this.broadcastService.msalSubject$
      .pipe(
        filter((ev: EventMessage) => ev.eventType === EventType.LOGIN_SUCCESS),
        takeUntil(this._destroying$)
      )
      .subscribe((_) => {
        console.log('login success', _);
      });

    this.broadcastService.msalSubject$
      .pipe(
        filter(
          (ev: EventMessage) => ev.eventType === EventType.ACQUIRE_TOKEN_FAILURE
        ),
        takeUntil(this._destroying$)
      )
      .subscribe((r) => {
        console.error('Failed getting token', r.error);
        // const loggedIn = this.checkLoggedIn();

        // this.isLoggedIn$.next(loggedIn);

        // if (!loggedIn && !this.loginInProgress) {
        //   this.login();
        // }
      });
  }

  checkLoggedIn() {
    console.log(
      'checking logged in/azure identity prov',
      this.msalService.instance.getAllAccounts()
    );
    const loggedIn = this.msalService.instance.getAllAccounts().length > 0;
    if (loggedIn) {
      const tokenValid =
        this.msalService.instance.getAllAccounts()[0].idTokenClaims['exp'] >
        new Date().getSeconds();
      this.isLoggedIn$.next(tokenValid);
    } else {
      this.isLoggedIn$.next(false);
    }
  }

  getAccount(): Observable<ColidAccount | null> {
    let azureAccount: any;
    return this.isLoggedIn$.pipe(
      map((isLoggedIn) => {
        if (
          !azureAccount &&
          this.msalService.instance.getAllAccounts().length > 0
        ) {
          let accounts = this.msalService.instance.getAllAccounts();
          this.msalService.instance.setActiveAccount(accounts[0]);
          azureAccount = accounts[0];
        } else {
          azureAccount = this.msalService.instance.getActiveAccount();
        }
        if (!isLoggedIn) {
          return null;
        } else {
          const accountRoles: any = azureAccount.idTokenClaims['roles'];
          return new ColidAccount(
            azureAccount.name,
            azureAccount.username,
            azureAccount.localAccountId,
            accountRoles
          );
        }
      })
    );
  }

  loginInProgress(): boolean {
    return this.loggingIn;
  }

  login(): void {
    this.msalService.loginRedirect();
  }

  logout(): void {
    this.msalService.logout();
  }

  cleanup(): void {
    this._destroying$.next();
    this._destroying$.complete();
  }
}
