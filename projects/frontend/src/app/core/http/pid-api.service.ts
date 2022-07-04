import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "projects/frontend/src/environments/environment";
import { Observable, of } from "rxjs";
import { SchemaDto } from "../../shared/models/dto/table-schema-dto";

@Injectable({
    providedIn: 'root'
})
export class PidApiService {
    private readonly baseUrl = environment.pidApi;

    constructor(
        private httpClient: HttpClient
    ) {

    }

    getSchemaInfo(pidUri: string): Observable<SchemaDto> {
        const url: string = this.baseUrl + 'resource/linkedTableAndColumnResource';
        let params: HttpParams = new HttpParams();
        params = params.append("pidUri", pidUri);
        if (environment.environment == 'local') {
            return of({
                "tables": [
                    {
                        "linkedTableFiled": [
                            {
                                "resourceId": "https://pid.bayer.com/kos/19050#92de5ceb-10ca-4ec7-85c2-14962be8ecc4",
                                "pidURI": "https://dev-pid.bayer.com/630e54ca-16fb-405e-8f11-f9a6b6133582/",
                                "label": ""
                            },
                            {
                                "resourceId": "https://pid.bayer.com/kos/19050#a4b7de72-fcd8-45d2-a1c3-6ca361ea74df",
                                "pidURI": "https://dev-pid.bayer.com/e98b7031-1b95-4789-8aed-7cda26654fdd/",
                                "label": ""
                            },
                            {
                                "resourceId": "https://pid.bayer.com/kos/19050#ad73a393-209b-4f0d-b376-9c8187964d94",
                                "pidURI": "https://dev-pid.bayer.com/9f1b4fc1-8779-401b-b458-60b60dac80ff/",
                                "label": ""
                            },
                            {
                                "resourceId": "https://pid.bayer.com/kos/19050#8547435b-131a-4e11-9d27-eb98e99811bd",
                                "pidURI": "https://dev-pid.bayer.com/1c9672fc-a439-4ebb-8461-3209e9274271/",
                                "label": ""
                            },
                            {
                                "resourceId": "https://pid.bayer.com/kos/19050#0e221054-ffd6-451f-8dcc-f542f524cc64",
                                "pidURI": "https://dev-pid.bayer.com/d9d0b550-e260-431a-a8e7-d5558db11bfe/",
                                "label": ""
                            }
                        ],
                        "resourceId": "https://pid.bayer.com/kos/19050#b8ea0faa-9bca-4c2f-8841-825cdeb7ef77",
                        "pidURI": "https://dev-pid.bayer.com/7aecff0d-f051-4970-8522-9359bb2d3fb6/",
                        "label": ""
                    }
                ],
                "columns": []
            });
        }
        return this.httpClient.get<SchemaDto>(url, { params: params });
    }
}