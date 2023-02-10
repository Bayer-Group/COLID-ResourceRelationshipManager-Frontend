import { Injectable } from '@angular/core';
import { environment } from 'projects/frontend/src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDto } from 'projects/frontend/src/app/shared/user-dto';
import { SearchFilterDataMarketplaceDto } from 'projects/frontend/src/app/shared/search-filter-data-marketplace-dto';
import { MessageConfigDto } from 'projects/frontend/src/app/state/message-config-dto';
import { StoredQueryDto } from 'projects/frontend/src/app/shared/stored-query-dto';

@Injectable({
  providedIn: 'root',
})
export class UserInfoApiService {
  constructor(private httpClient: HttpClient) {}

  createUser(id: string, emailAddress: string): Observable<UserDto> {
    const url = `${environment.appDataApiUrl}Users/`;
    return this.httpClient.post<UserDto>(url, new UserDto(id, emailAddress));
  }

  getUser(id: string): Observable<UserDto> {
    const url = `${environment.appDataApiUrl}Users/${id}`;
    return this.httpClient.get<UserDto>(url);
  }
}
