import { FilterGroupingOrderRaw } from './filter-grouping-order-raw';
import { Aggregation } from './aggregation';

export interface FilterGroupingOrder extends FilterGroupingOrderRaw {
  expanded: boolean;
  filters: {
    propertyOrder: number;
    propertyUri: string;
    aggregation: Aggregation;
  }[];
}
