import { Injectable } from '@angular/core';
import { environment } from 'projects/frontend/src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDto } from 'projects/frontend/src/app/shared/user-dto';
import { ColidEntrySubscriptionDto } from 'projects/frontend/src/app/shared/colid-entry-subscription-dto';
import { SearchFilterDataMarketplaceDto } from 'projects/frontend/src/app/shared/search-filter-data-marketplace-dto';
import { MessageConfigDto } from 'projects/frontend/src/app/state/message-config-dto';
import { StoredQueryDto } from 'projects/frontend/src/app/shared/stored-query-dto';

@Injectable({
  providedIn: 'root'
})
export class UserInfoApiService {

  constructor(private httpClient: HttpClient) { }

  createUser(id: string, emailAddress: string): Observable<UserDto> {
    const url = `${environment.appDataApiUrl}Users/`;
    return this.httpClient.post<UserDto>(url, new UserDto(id, emailAddress));
  }

  getUser(id: string): Observable<UserDto> {
    const url = `${environment.appDataApiUrl}Users/${id}`;
    return this.httpClient.get<UserDto>(url);
  }

  setLastLoginDataMarketplace(id: string, date: Date) {
    const url = `${environment.appDataApiUrl}Users/${id}/lastLoginDataMarketplace`;
    return this.httpClient.put<UserDto>(url, date);
  }

  addColidEntrySubscription(id: string, colidEntrySubscriptionDto: ColidEntrySubscriptionDto): Observable<any> {
    const url = `${environment.appDataApiUrl}Users/${id}/colidEntrySubscriptions`;
    return this.httpClient.put(url, colidEntrySubscriptionDto);
  }

  removeColidEntrySubscription(id: string, colidEntrySubscriptionDto: ColidEntrySubscriptionDto): Observable<any> {
    const url = `${environment.appDataApiUrl}Users/${id}/colidEntrySubscriptions`;

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: colidEntrySubscriptionDto
    };

    return this.httpClient.delete(url, httpOptions);
  }

  addSearchFilterDataMarketplace(id: string, searchFilterDataMarketplaceDto: SearchFilterDataMarketplaceDto): Observable<any> {
    const url = `${environment.appDataApiUrl}Users/${id}/searchFiltersDataMarketplace`;
    return this.httpClient.put(url, searchFilterDataMarketplaceDto);
  }

  setDefaultSearchFilterDataMarketplace(id: string, searchFilterDataMarketplaceId: number): Observable<any> {
    const url = `${environment.appDataApiUrl}Users/${id}/defaultSearchFilterDataMarketplace/${searchFilterDataMarketplaceId}`;
    return this.httpClient.put(url, null);
  }

  setMessageConfig(id: string, messageConfigDto: MessageConfigDto): Observable<any> {
    const url = `${environment.appDataApiUrl}Users/${id}/messageconfig`;
    return this.httpClient.put(url, messageConfigDto);
  }

  removeSearchFilterDataMarketplace(id: string, searchFilterDataMarketplaceId: number): Observable<any> {
    const url = `${environment.appDataApiUrl}Users/${id}/searchFiltersDataMarketplace/${searchFilterDataMarketplaceId}`;
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: null
    };
    return this.httpClient.delete(url, httpOptions);
  }

  getStoredQueryDataMarketplace(id: string): Observable<any> {
    const url = `${environment.appDataApiUrl}Users/${id}/subscribedSearchFiltersDataMarketplace`;
    return this.httpClient.get<SearchFilterDataMarketplaceDto[]>(url);
  }

  getSearchFiltersDataMarketplace(id: string): Observable<any> {
    const url = `${environment.appDataApiUrl}Users/${id}/searchFiltersDataMarketplace`;
    return this.httpClient.get<SearchFilterDataMarketplaceDto[]>(url);
  }

  getAllStoredQueryDataMarketplace(): Observable<any> {
    const url = `${environment.appDataApiUrl}Users/allSubscribedSearchFiltersDataMarketplace`;
    return this.httpClient.get<SearchFilterDataMarketplaceDto[]>(url);
  }

  addStoredQueryDataMarketplace(id: string, storedQueryDto: StoredQueryDto): Observable<any> {
    const url = `${environment.appDataApiUrl}Users/${id}/subscribeToSearchFilterDataMarketplace`;
    return this.httpClient.put(url, storedQueryDto);
  }

  removeStoredQueryDataMarketplace(id: string, searchFilterDataMarketplaceId: number): Observable<any> {
    const url = `${environment.appDataApiUrl}Users/${id}/removeSubscriptionFromSearchFilterDataMarketplace/${searchFilterDataMarketplaceId}`;
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: null
    };
    return this.httpClient.delete(url, httpOptions);
  }
}
