import { ItemDescriptor } from './resource-descriptor-mini';

export class LinkTypesDto {
  sourceUri: string = '';
  linkType: any = {};
  targetUri: string = '';
}

export class UriName {
  value: string = '';
  name: string = '';
  nameValuePairId?: string | null = null;
}

export class LinkTypeContainer {
  source: ItemDescriptor = new ItemDescriptor();
  target: ItemDescriptor = new ItemDescriptor();
  linkType: any = {};
}
