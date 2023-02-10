import { HttpClient, HttpParams } from "@angular/common/http"; 
import { Injectable } from "@angular/core"; 
import { environment } from "projects/frontend/src/environments/environment"; 
import { Observable, of } from "rxjs"; 
import { SchemaDto } from "../../shared/models/dto/table-schema-dto"; 
 
@Injectable({ 
    providedIn: 'root' 
}) 
export class PidApiService { 
    private readonly baseUrl = environment.colidApiUrl; 
 
    constructor( 
        private httpClient: HttpClient 
    ) { 
 
    } 
 
    getSchemaInfo(pidUri: string): Observable<SchemaDto> { 
        const url: string = this.baseUrl + 'resource/linkedTableAndColumnResource'; 
        let params: HttpParams = new HttpParams(); 
        params = params.append("pidUri", pidUri); 
        return this.httpClient.get<SchemaDto>(url, { params: params }); 
    } 
}