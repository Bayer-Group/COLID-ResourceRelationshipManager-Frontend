import { UriName } from './link-types-dto';

export class ResourceDto {
  links: ResourceLinkDto[] = [];
  versions: VersionDto[] = [];
  name: string = '';
  pidUri: string | null = '';
  resourceIdentifier: string = '';
  resourceType: string = '';
  laterVersion?: VersionDto | null = null;
  previousVersion?: VersionDto | null = null;
}

export class ResourceLinkDto {
  constructor() {}
  endNode: UriName = {
    name: '',
    value: '',
    nameValuePairId: null
  };
  startNode: UriName = {
    name: '',
    value: '',
    nameValuePairId: null
  };
  status?: GenericStatus = {
    key: '',
    value: ''
  };
  type: UriName = new UriName();
  mapLinkInfoId?: string | null = null;
}

export class GenericStatus {
  key: string = '';
  value: string = '';
}

export class VersionDto {
  id: string = '';
  version: string = '';
  pidUri: string = '';
}
