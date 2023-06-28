import { SelectionModel } from '@angular/cdk/collections';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { IconTypes } from 'src/app/shared/icons/models/icon-types';
import { LinkDto } from 'src/app/shared/models/link-dto';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'colid-display-links',
  templateUrl: './display-links.component.html',
  styleUrls: ['./display-links.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayLinksComponent implements OnInit {
  _links: LinkDto[];
  @Input() set links(value: LinkDto[]) {
    this._links = value.slice().map((l) => {
      if (l.isVersionLink) {
        l.linkType.value = 'Version Link';
      }
      return l;
    });
    this.originalLinksSource = this._links.slice();
    this.linksDataSource = this._links.slice(
      0,
      this.currentlyDisplayedLinkCount
    );
  }
  @Input() selection: SelectionModel<LinkDto>;

  linksDataSource: LinkDto[];
  originalLinksSource: LinkDto[];
  inputSearchEnabled: boolean = false;
  currentInputFilter: string = '';
  currentSorting: { column: string; sortDirection: string } = {
    column: '',
    sortDirection: '',
  };
  searchInput$ = new Subject<string>();
  currentlyDisplayedLinkCount = 25;
  scrolledInCount = 25;

  displayedColumns = [
    'select',
    'outbound',
    'targetType',
    'linkType',
    'targetName',
  ];

  @ViewChild(MatTable) table!: MatTable<any>;
  @ViewChild('infiniteScroller', { static: false })
  infiniteScroller!: ElementRef;
  @ViewChild(InfiniteScrollDirective) infiniteScrollDirective;

  S3: IconTypes = IconTypes.S3;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.originalLinksSource = this._links.slice();
    this.linksDataSource = this._links.slice(
      0,
      this.currentlyDisplayedLinkCount
    );
    this.searchInput$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((searchTerm: string) => {
        this.currentInputFilter = searchTerm;
        this.applyFilter(searchTerm);
        if (this.currentSorting.column && this.currentSorting.sortDirection) {
          this.applySorting(
            this.currentSorting.column,
            this.currentSorting.sortDirection
          );
        }
        this.resetTableView();
        this.cdr.detectChanges();
      });
  }

  isOverflow(el: HTMLElement): boolean {
    let curOverflow = el.style.overflow;
    if (!curOverflow || curOverflow === 'visible') el.style.overflow = 'hidden';
    let isOverflowing =
      el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;
    el.style.overflow = curOverflow;
    return isOverflowing;
  }

  onInputChange(event) {
    this.searchInput$.next(event.target.value);
    const filterValue: string = (event.target as HTMLInputElement).value;
    if (filterValue.length == 0) this.inputSearchEnabled = false;
  }

  applyFilter(searchString: string) {
    if (searchString) {
      this._links = this.originalLinksSource.filter((item) =>
        item.targetName
          .toLowerCase()
          .includes(searchString.trim().toLowerCase())
      );
    } else {
      this._links = this.originalLinksSource.slice();
    }
  }

  onSortChange(sort: Sort) {
    const { active, direction } = sort;
    this.currentSorting.column = active;
    this.currentSorting.sortDirection = direction;
    if (this.currentInputFilter) {
      this.applyFilter(this.currentInputFilter);
    }
    this.applySorting(active, direction);
    this.resetTableView();
  }

  applySorting(sortColumn: string, sortDirection: string) {
    if (sortDirection === '' && this.currentInputFilter) {
      return;
    } else if (sortDirection === '') {
      this._links = this.originalLinksSource.slice();
    } else {
      this._links.sort((a, b) => {
        let result = 0;

        if (sortColumn === 'outbound') {
          if (a.isVersionLink && b.isVersionLink) {
            result = 0;
          } else if (a.isVersionLink) {
            result = 1;
          } else if (b.isVersionLink) {
            result = -1;
          } else {
            result = Number(a.outbound) - Number(b.outbound);
          }
        }

        if (sortColumn === 'targetType') {
          const firstTargetType = a.targetType.toLowerCase();
          const secondTargetType = b.targetType.toLowerCase();
          if (firstTargetType < secondTargetType) {
            result = -1;
          }
          if (firstTargetType > secondTargetType) {
            result = 1;
          }
        }

        if (sortColumn === 'linkType') {
          const firstLinkType = a.linkType.value.toLowerCase();
          const secondLinkType = b.linkType.value.toLowerCase();
          if (firstLinkType < secondLinkType) {
            result = -1;
          }
          if (firstLinkType > secondLinkType) {
            result = 1;
          }
        }

        if (sortDirection === 'desc') {
          result *= -1;
        }

        return result;
      });
    }
  }

  private resetTableView() {
    this.infiniteScroller.nativeElement.scrollTop = 0;
    this.currentlyDisplayedLinkCount = this.scrolledInCount;
    this.linksDataSource = this._links.slice(0, this.scrolledInCount);
  }

  onScrolled(_) {
    if (this.currentlyDisplayedLinkCount < this._links.length) {
      const scrolledIntoLinks = this._links.slice(
        this.currentlyDisplayedLinkCount,
        this.currentlyDisplayedLinkCount + this.scrolledInCount
      );
      this.currentlyDisplayedLinkCount += this.scrolledInCount;
      this.linksDataSource.push(...scrolledIntoLinks);
      this.table.renderRows();
    }
  }
}
