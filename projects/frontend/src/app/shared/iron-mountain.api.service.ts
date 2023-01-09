import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResourceRetentionClasses } from 'projects/frontend/src/app/shared/resource-retentionClass';
import { policyRequest } from 'projects/frontend/src/app/shared/policy-request';

@Injectable({
  providedIn: 'root'
})
export class IronMountainService {
  constructor(private httpClient: HttpClient) { }

  getIronMountainResourcePolicies(policyRequestValues: policyRequest[]): Observable<ResourceRetentionClasses[]> {
    /* const url = `${environment.colidApiUrl}/resourcepolicies`;
     var resourcePolicies =this.httpClient.post<ResourceRetentionClasses[]>(url, policyRequestValues); 
     return resourcePolicies*/
    return null
  }
}