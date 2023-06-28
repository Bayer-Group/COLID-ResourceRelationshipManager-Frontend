import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StatusBuildInformationDto } from '../models/dto/status-build-information-dto';
import { RawDeploymentInformationDto } from '../models/dto/raw-deployment-information-dto';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class StatusApiService {
  constructor(private httpClient: HttpClient) {}

  getBuildInformation(): Observable<StatusBuildInformationDto> {
    const url = environment.deploymentInfoUrl;

    return this.httpClient.get<RawDeploymentInformationDto>(url).pipe(
      map((res: RawDeploymentInformationDto) => {
        let dmpInformation = res.services['rrm-ui'];
        return {
          versionNumber: res.version,
          imageTags: dmpInformation.image_tags,
          latestReleaseDate: new Date(
            dmpInformation.image_pushed_at_epoch_utc_seconds * 1000
          ),
        } as StatusBuildInformationDto;
      })
    );
  }
}
