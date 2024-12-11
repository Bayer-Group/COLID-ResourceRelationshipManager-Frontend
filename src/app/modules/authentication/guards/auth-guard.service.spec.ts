import { TestBed, inject } from '@angular/core/testing';

import { AuthGuardService } from './auth-guard.service';
import { AuthService } from '../services/auth.service';
import {
  ActivatedRouteSnapshot,
  ParamMap,
  RouterModule
} from '@angular/router';
import { RouteExtension } from 'src/app/shared/extensions/route.extension';

describe('AuthGuardService', () => {
  class MockAuthService {}

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule],
      providers: [
        AuthGuardService,
        {
          provide: AuthService,
          useClass: MockAuthService
        }
      ]
    });
  });

  it('should be created', inject(
    [AuthGuardService],
    (service: AuthGuardService) => {
      expect(service).toBeTruthy();
    }
  ));

  it('should put url segments in session storage for redirect after auth', () => {
    const mockRoute: ActivatedRouteSnapshot = {
      url: [
        {
          path: 'home',
          parameters: {},
          parameterMap: {} as ParamMap
        }
      ],
      children: [
        {
          url: [],
          children: [
            {
              url: [
                {
                  path: 'graph',
                  parameters: {},
                  parameterMap: {} as ParamMap
                },
                {
                  path: 'some-map-id',
                  parameters: {},
                  parameterMap: {} as ParamMap
                }
              ],
              children: []
            }
          ]
        } as ActivatedRouteSnapshot
      ]
    } as ActivatedRouteSnapshot;

    const expectedUrlSegments = JSON.stringify([
      'home',
      'graph',
      'some-map-id'
    ]);

    spyOn(Storage.prototype, 'setItem').and.callFake((key, value) => {
      expect(value).toBe(expectedUrlSegments);
    });

    RouteExtension.SetRouteInStorage(mockRoute);
  });
});
