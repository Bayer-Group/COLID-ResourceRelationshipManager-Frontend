import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DocumentMap } from '../../shared/search-result';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private readonly baseUrl = environment.dmpCoreApiUrl;

  constructor(private httpClient: HttpClient) {}

  getDocument(id: string): Observable<DocumentMap> {
    let params = new HttpParams().set('id', id);
    return this.httpClient.get<DocumentMap>(this.baseUrl + 'document', {
      params: params,
    });
  }
}
