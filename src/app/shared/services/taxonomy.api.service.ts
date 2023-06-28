import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TaxonomyDTO } from '../models/dto/taxonomy-dto';

@Injectable({
  providedIn: 'root',
})
export class TaxonomyService {
  constructor(private httpClient: HttpClient) {}

  getTaxonomyList(taxonomyType: string): Observable<TaxonomyDTO[]> {
    const url = `${environment.colidApiUrl}taxonomyList`;
    let params = new HttpParams().append('taxonomyType', taxonomyType);
    return this.httpClient.get<TaxonomyDTO[]>(url, { params });
  }
}
