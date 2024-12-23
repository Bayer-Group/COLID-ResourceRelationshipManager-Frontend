import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';
import { AggregationBucket } from '../../../shared/models/aggregation-bucket';
import { Store } from '@ngxs/store';
import {
  Aggregation,
  AggregationType
} from '../../../shared/models/aggregation';
import {
  ChangeActiveAggregationBuckets,
  ChangeActiveAggregationBucketList
} from '../../../state/search.state';
import { CheckboxHierarchyDTO } from '../../../shared/models/dto/checkboxHierarchy-dto';

enum CollapseStates {
  Initial,
  More,
  All
}

@Component({
  selector: 'app-filter-box',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filter-box.component.html',
  styleUrls: ['./filter-box.component.scss']
})
export class FilterBoxComponent implements OnInit {
  @Input() aggregation: Aggregation;
  @Input() activeAggregationBuckets: string[] = [];
  @Input() filterType:
    | 'taxonomy'
    | 'checkbox'
    | 'checkBoxHierarchy'
    | 'select' = 'checkbox';

  resourceHierarchy: CheckboxHierarchyDTO[]; //muss ich added damit der code funktioniert

  constructor(private store: Store) {}

  readonly initialSize = 7;
  readonly moreSize = 20;

  aggregationType = AggregationType;
  visibleBuckets: AggregationBucket[] = [];
  hidden: boolean;
  loading: boolean;
  canShowMore: boolean;
  canShowLess: boolean;
  canShowAll: boolean;
  collapseState: CollapseStates;
  selectedBoxes: any[] = [];

  ngOnInit() {
    this.setCollapseState(
      this.filterType === 'checkbox'
        ? CollapseStates.Initial
        : CollapseStates.All
    );
  }

  showLess() {
    this.setCollapseState(
      this.collapseState === CollapseStates.All
        ? CollapseStates.More
        : CollapseStates.Initial
    );
  }

  showMore() {
    this.setCollapseState(CollapseStates.More);
  }

  showAll() {
    this.setCollapseState(CollapseStates.All);
  }

  setCollapseState(state: CollapseStates) {
    this.collapseState = state;
    switch (state) {
      case CollapseStates.Initial:
        this.visibleBuckets = this.aggregation.buckets.slice(
          0,
          this.initialSize
        );
        break;
      case CollapseStates.More:
        this.visibleBuckets = this.aggregation.buckets.slice(0, this.moreSize);
        break;
      case CollapseStates.All:
        this.visibleBuckets = this.aggregation.buckets;
        break;
    }
    this.canShowAll =
      this.collapseState === CollapseStates.More &&
      this.aggregation.buckets.length > this.moreSize;
    this.canShowMore =
      this.collapseState === CollapseStates.Initial &&
      this.aggregation.buckets.length > this.initialSize;
    this.canShowLess = this.collapseState !== CollapseStates.Initial;
  }

  active(aggregationBucket: AggregationBucket) {
    return this.activeAggregationBuckets == null ||
      !Array.isArray(this.activeAggregationBuckets)
      ? false
      : this.activeAggregationBuckets.includes(aggregationBucket.key);
  }

  filterItemChanged(active: boolean, bucket: AggregationBucket) {
    if (this.aggregation) {
      this.store.dispatch(
        new ChangeActiveAggregationBuckets(this.aggregation, bucket, active)
      );
    }
  }

  filterHierarchyItemsChanged(bucketIds: string[]) {
    var bucketNames = [];

    bucketIds.forEach((item) => {
      var suffixIndex = item.indexOf('#');
      var trimmed = item.substring(0, suffixIndex);
      if (!bucketNames.includes(trimmed)) {
        bucketNames.push(trimmed);
      }
    });

    if (this.aggregation) {
      this.store.dispatch(
        new ChangeActiveAggregationBucketList(this.aggregation, bucketNames)
      );
    }
  }

  filterItemsChanged(buckets: string[]) {
    if (this.aggregation) {
      this.store.dispatch(
        new ChangeActiveAggregationBucketList(this.aggregation, buckets)
      );
    }
  }

  multiSelectFilterItemsChanged(buckets: [{ key: string; doc_count: number }]) {
    if (this.aggregation) {
      this.store.dispatch(
        new ChangeActiveAggregationBucketList(
          this.aggregation,
          buckets.map((b) => b.key)
        )
      );
    }
  }
}
