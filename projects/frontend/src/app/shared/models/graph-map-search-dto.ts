
export class GraphMapSearchDTO {
    constructor() { }

    batchSize: number = 0;
    nameFilter: string = "";
    sortKey: string = "";
    sortType: 'asc' | 'des' | '' = '';
}