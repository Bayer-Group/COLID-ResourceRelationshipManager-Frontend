export class GraphLinkSearchDto {
  constructor() {}
  nameFilter: string = '';
  sortKey: string = '';
  sortType: 'asc' | 'des' | '' = '';
}
