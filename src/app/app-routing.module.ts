import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './modules/authentication/guards/auth-guard.service';
import { LoggedInComponent } from './shared/components/logged-in/logged-in.component';
import { LoginInProgressComponent } from './shared/components/login-in-progress/login-in-progress.component';
import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';

const routes: Routes = [
  {
    path: 'unauthorized',
    component: UnauthorizedComponent
  },
  {
    path: 'logged-in',
    component: LoggedInComponent
  },
  {
    path: 'login-in-progress',
    component: LoginInProgressComponent
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home/graph'
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./features/home/home.module').then((m) => m.HomeModule),
    canActivate: [AuthGuardService]
  },
  {
    path: '**',
    redirectTo: 'home/graph'
  } /*
  {
    path: 'search',
    component: SearchComponent, canActivate: [AuthGuardService]
  }
  */
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'ignore' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
