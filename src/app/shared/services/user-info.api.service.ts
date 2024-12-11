import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDto } from 'src/app/shared/models/dto/user-dto';
import { ColidEntrySubscriptionDto } from '../models/dto/colid-entry-subscription-dto';

@Injectable({
  providedIn: 'root'
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

  addColidEntrySubscription(
    id: string,
    colidEntrySubscriptionDto: ColidEntrySubscriptionDto
  ): Observable<any> {
    const url = `${environment.appDataApiUrl}Users/${id}/colidEntrySubscriptions`;
    return this.httpClient.put(url, colidEntrySubscriptionDto);
  }

  removeColidEntrySubscription(
    id: string,
    colidEntrySubscriptionDto: ColidEntrySubscriptionDto
  ): Observable<any> {
    const url = `${environment.appDataApiUrl}Users/${id}/colidEntrySubscriptions`;

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: colidEntrySubscriptionDto
    };

    return this.httpClient.delete(url, httpOptions);
  }
}
