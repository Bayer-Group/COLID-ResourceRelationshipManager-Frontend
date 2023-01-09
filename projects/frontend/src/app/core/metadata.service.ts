import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {

  private readonly baseUrl = environment.dmpCoreApiUrl;

  constructor(private httpClient: HttpClient) { }

  getMetadata(): Observable<any> {
    // if (environment.environment == 'local') {
    //   // return this.httpClient.get<any>(`${environment.colidApiUrl}/metadata`)
    //   return this.getMockData('./assets/mockdata/api_metadata_mock.json')
    // }
    return this.httpClient.get<any>(this.baseUrl + 'metadata');
  }

  getMetadataTypes(): Observable<any> {
    // if (environment.environment == 'local') {
    //   return this.getMockData("./assets/mockdata/api_metadata_types_mock.json");
    // } please do not uncomment this. 

    return this.httpClient.get<any>(this.baseUrl + 'metadata/types');
  }

  getMockData(filename: string): Observable<any> {
    return this.httpClient.get<any>(filename);
  }
}
