import { NgModule, ModuleWithProviders, Provider } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { AuthGuardService } from './guards/auth-guard.service';
import { MockAuthenticationModule } from './mock-authentication.module';
import { AzureAuthenticationModule } from './azure-authentication.module';
import { environment } from 'projects/frontend/src/environments/environment';

export const providers: Provider[] = [AuthGuardService, AuthService];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    environment.allowAnonymous ? MockAuthenticationModule.forRoot() : AzureAuthenticationModule.forRoot()
  ],
  providers: [providers],
  exports: [
    environment.allowAnonymous ? MockAuthenticationModule : AzureAuthenticationModule
  ]
})
export class AuthenticationModule {
  static forRoot(): ModuleWithProviders<AuthenticationModule> {
    return {
      ngModule: AuthenticationModule,
      providers: [providers]
    };
  }
}
