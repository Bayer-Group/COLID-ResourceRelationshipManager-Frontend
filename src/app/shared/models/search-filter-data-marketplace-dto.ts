import { SearchFilterCollectionDto } from './dto/search-filter-collection-dto';
import { StoredQueryDto } from './dto/stored-query-dto';

export class SearchFilterDataMarketplaceDto {
  id: number;
  name: string;
  searchTerm: string;
  filterJson: SearchFilterCollectionDto;
  storedQuery: StoredQueryDto;

  public constructor(name: string, searchTerm: string, filterJson: any) {
    this.name = name;
    this.searchTerm = searchTerm;
    this.filterJson = filterJson;
  }
}
