import { FetchResourceDto } from './fetch-resource-dto';

export class AddResourceCto {
  total: number = 0;
  items: Array<FetchResourceDto> = new Array<FetchResourceDto>();
}
