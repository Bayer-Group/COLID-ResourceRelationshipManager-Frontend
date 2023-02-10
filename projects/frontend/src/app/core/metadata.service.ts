import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MetadataService {
  private readonly baseUrl = environment.dmpCoreApiUrl;

  constructor(private httpClient: HttpClient) {}

  getMetadata(): Observable<any> {
    return this.httpClient.get<any>(this.baseUrl + 'metadata');
  }

  getMetadataTypes(): Observable<any> {
    return this.httpClient.get<any>(this.baseUrl + 'metadata/types');
  }
}
