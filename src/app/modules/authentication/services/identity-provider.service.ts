import { ColidAccount } from '../models/colid-account.model';
import { Observable } from 'rxjs';

export interface IdentityProvider {
  getAccount(): Observable<ColidAccount | null>;
  loginInProgress(): boolean;
  isLoggedIn$: Observable<boolean>;
  login(): void;
  logout(): void;
  cleanup(): void;
}
