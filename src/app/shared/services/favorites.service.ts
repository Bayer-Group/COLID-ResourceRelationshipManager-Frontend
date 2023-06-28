import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MessageDto } from '../user/message-dto';
import { FavoriteListMetadata, Favorites } from '../models/favorites';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  constructor(private httpClient: HttpClient) {}

  //This endpoint fetches all the favorite lists
  getFavorites(userId: string): Observable<FavoriteListMetadata[]> {
    const url = `${environment.appDataApiUrl}Users/favoritesList/${userId}`;
    return this.httpClient.get<FavoriteListMetadata[]>(url);
  }

  //This endpoint deletes a favorite list meaning that the entries inside will also be deleted with it
  deleteFavoriteList(
    userId: string,
    favoritesListId: string
  ): Observable<MessageDto> {
    const url = `${environment.appDataApiUrl}Users/${userId}/favoritesList/${favoritesListId}`;
    return this.httpClient.delete<MessageDto>(url);
  }

  //This endpoint adds multiple entries inside favorite list
  addFavoriteEntries(userId: string, payload: any): Observable<Favorites> {
    const url = `${environment.appDataApiUrl}Users/favoritesListEntries/${userId}`;
    return this.httpClient.put<Favorites>(url, payload);
  }

  //This endpoint creates a Favorites List - if only provided name it creates a blank list
  createFavoritesList(userId: string, payload: any): Observable<Favorites[]> {
    const url = `${environment.appDataApiUrl}Users/favoritesList/${userId}`;
    return this.httpClient.put<Favorites[]>(url, payload);
  }
}
