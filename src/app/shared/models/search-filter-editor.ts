import { ResourceSearchDTO } from 'src/app/shared/resource-search-dto';

export class SearchFilterEditor {
  filterJson: ResourceSearchDTO;

  constructor(searchFilters: ResourceSearchDTO) {
    this.filterJson = searchFilters;
  }
}
