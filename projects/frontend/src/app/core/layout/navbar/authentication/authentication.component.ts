import { Component, OnInit } from '@angular/core';
import { AuthService } from 'projects/frontend/src/app/modules/authentication/services/auth.service';
import { IconTypes } from 'projects/frontend/src/app/shared/icons/models/icon-types';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'colid-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})
export class AuthenticationComponent implements OnInit {
  S3: IconTypes = IconTypes.S3;
  Default: IconTypes = IconTypes.Default;
  Mapping: IconTypes = IconTypes.Mapping;

  userName: string = "Account";

  constructor(
    private authService: AuthService
  ) {

  }

  ngOnInit() {
    this.authService.currentName$.pipe(
      tap(u => this.userName = typeof u == 'string' ? u : "Account")
    ).subscribe();
  }
}
