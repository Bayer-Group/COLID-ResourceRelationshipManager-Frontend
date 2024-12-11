import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourceApiService } from '../services/resource.api.service';
import { LinkHistoryDto } from '../models/link-history-dto';
import { SharedModule } from '../shared.module';
import { MatDialog } from '@angular/material/dialog';
import { IconTypes } from '../icons/models/icon-types';
import { MatTable } from '@angular/material/table';
import { Sort } from '@angular/material/sort';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';
import { AuthService } from '../../modules/authentication/services/auth.service';
import { catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { BehaviorSubject, EMPTY, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Constants } from '../constants';

export interface HistoryItemTableEntry {
  linkType: {
    key: string;
    value: string;
  };
  linkStatus: string;
  outbound: boolean;
  source: string;
  sourceName: string;
  sourceType: string;
  target: string;
  targetName: string;
  targetType: string;
  dateCreated: string;
  dateDeleted: string;
  author: string;
  deletedBy: string;
}

@Component({
  selector: 'colid-link-history',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './link-history.component.html',
  styleUrls: ['./link-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkHistoryComponent implements OnInit {
  @Input() startPidUri: string;
  @Input() endPidUri: string;
  @Input() isNodeLinkHistory = true;

  @Output()
  newLink: EventEmitter<HistoryItemTableEntry> =
    new EventEmitter<HistoryItemTableEntry>();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  inputSearchEnabled: boolean = false;
  searchInput$ = new Subject<string>();
  currentInputFilter: string = '';
  currentSorting: { column: string; sortDirection: string } = {
    column: '',
    sortDirection: ''
  };
  originalHistoryItemsSource: HistoryItemTableEntry[];
  historyItemsSource: HistoryItemTableEntry[];
  historyItems: HistoryItemTableEntry[];
  S3: IconTypes = IconTypes.S3;
  constants = Constants;
  currentlyDisplayedHistoryEntries = 25;
  scrolledInCount = 25;

  @ViewChild('linkHistoryTable') table!: MatTable<HistoryItemTableEntry>;
  @ViewChild('infiniteScroller', { static: false })
  infiniteScroller!: any;

  displayedColumns = [];

  nodeDisplayedColumns = [
    'outbound',
    'resourceType',
    'linkType',
    'resourceName',
    'dateCreated',
    'author',
    'dateDeleted',
    'deletedBy',
    'status',
    'restoreAction'
  ];

  linkDisplayedColumns = [
    'source',
    'sourceType',
    'linkType',
    'target',
    'targetType',
    'dateCreated',
    'author',
    'dateDeleted',
    'deletedBy',
    'status',
    'restoreAction'
  ];

  constructor(
    private resourceApiService: ResourceApiService,
    private dialog: MatDialog,
    private auth: AuthService,
    private snackbar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.displayedColumns = this.isNodeLinkHistory
      ? this.nodeDisplayedColumns
      : this.linkDisplayedColumns;
    this.resourceApiService
      .getLinkHistory(this.startPidUri, this.endPidUri)
      .subscribe((historyItems: LinkHistoryDto[]) => {
        this.isLoading$.next(false);
        this.originalHistoryItemsSource = historyItems.map(
          (item) =>
            <HistoryItemTableEntry>{
              linkType: {
                key: item.linkType,
                value: item.linkTypeLabel
              },
              linkStatus: item.linkStatus,
              outbound: !item.inBound,
              source: item.linkStartResourcePidUri,
              sourceName: item.linkStartResourceLabel,
              sourceType: item.linkStartResourceType,
              target: item.linkEndResourcePidUri,
              targetName: item.linkEndResourceLabel,
              targetType: item.linkEndResourceType,
              dateCreated: item.dateCreated,
              dateDeleted: item.dateDeleted,
              author: item.author,
              deletedBy: item.deletedBy
            }
        );
        this.historyItemsSource = [...this.originalHistoryItemsSource];
        this.historyItems = this.historyItemsSource.slice(
          0,
          this.scrolledInCount
        );
      });
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

  enableInputSearch() {
    this.inputSearchEnabled = true;
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
      this.historyItemsSource = this.originalHistoryItemsSource.slice();
    } else {
      this.historyItemsSource.sort((a, b) => {
        let result = 0;

        if (sortColumn === 'outbound') {
          result = Number(a.outbound) - Number(b.outbound);
        }

        if (sortColumn === 'resourceType') {
          const firstTargetType = a.outbound ? a.targetType : a.sourceType;
          const secondTargetType = b.outbound ? b.targetType : b.sourceType;

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

        if (sortColumn === 'author') {
          const firstCreatedBy = a.author.toLowerCase();
          const secondCreatedBy = b.author.toLowerCase();
          if (firstCreatedBy < secondCreatedBy) {
            result = -1;
          }
          if (firstCreatedBy > secondCreatedBy) {
            result = 1;
          }
        }

        if (sortColumn === 'dateCreated') {
          const firstDateCreated = new Date(a.dateCreated);
          const secondDateCreated = new Date(b.dateCreated);
          result = firstDateCreated.getTime() - secondDateCreated.getTime();
        }

        if (sortColumn === 'dateDeleted') {
          if (a.dateDeleted == null && b.dateDeleted == null) {
            result = 0;
          } else if (!a.dateDeleted) {
            result = 1;
          } else if (!b.dateDeleted) {
            result = -1;
          } else {
            const firstDateDeleted = new Date(a.dateCreated);
            const secondDateDeleted = new Date(b.dateCreated);
            result = firstDateDeleted.getTime() - secondDateDeleted.getTime();
          }
        }

        if (sortColumn === 'deletedBy') {
          if (
            (a.deletedBy == null && b.deletedBy == null) ||
            a.deletedBy === b.deletedBy
          ) {
            result = 0;
          } else if (!a.deletedBy) {
            result = 1;
          } else if (!b.deletedBy) {
            result = -1;
          } else {
            const firstDeletedBy = a.author.toLowerCase();
            const secondDeletedBy = b.author.toLowerCase();
            if (firstDeletedBy < secondDeletedBy) {
              result = -1;
            }
            if (firstDeletedBy > secondDeletedBy) {
              result = 1;
            }
          }
        }

        if (sortColumn === 'status') {
          if (a.linkStatus == b.linkStatus) {
            result = 0;
          } else if (
            a.linkStatus == this.constants.Metadata.Link.LifecycleStatus.Created
          ) {
            result = 1;
          } else {
            result = -1;
          }
        }

        if (sortDirection === 'desc') {
          result *= -1;
        }

        return result;
      });
    }
  }

  onInputChange(event) {
    this.searchInput$.next(event.target.value);
    const filterValue: string = (event.target as HTMLInputElement).value;
    if (filterValue.length == 0) this.inputSearchEnabled = false;
  }

  applyFilter(searchString: string) {
    if (searchString) {
      this.historyItemsSource = this.originalHistoryItemsSource.filter(
        (item) =>
          item.outbound
            ? item.targetName
                .toLowerCase()
                .includes(searchString.trim().toLowerCase())
            : item.sourceName
                .toLowerCase()
                .includes(searchString.trim().toLowerCase())
      );
    } else {
      this.historyItemsSource = this.originalHistoryItemsSource.slice();
    }
  }

  onScrolled(_) {
    if (
      this.currentlyDisplayedHistoryEntries < this.historyItemsSource.length
    ) {
      const scrolledIntoLinks = this.historyItemsSource.slice(
        this.currentlyDisplayedHistoryEntries,
        this.currentlyDisplayedHistoryEntries + this.scrolledInCount
      );
      this.currentlyDisplayedHistoryEntries += this.scrolledInCount;
      this.historyItems.push(...scrolledIntoLinks);
      this.table.renderRows();
    }
  }

  private resetTableView() {
    this.infiniteScroller.nativeElement.scrollTop = 0;
    this.currentlyDisplayedHistoryEntries = this.scrolledInCount;
    this.historyItems = this.historyItemsSource.slice(
      0,
      this.currentlyDisplayedHistoryEntries
    );
  }

  onRestoreLink(item: HistoryItemTableEntry) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        header: 'Confirm Link Recovery',
        body: `
          <p>Are you sure you want to restore the following link:</p>
          <p><b>Source:</b> ${item.sourceName}</p>
          <p><b>Target:</b> ${item.targetName}</p>
          <p><b>Link Type:</b> ${item.linkType.value}</p>
        `
      },
      width: 'auto',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.resourceApiService
          .createNewLink(
            item.source,
            item.linkType.key,
            item.target,
            this.auth.currentUserEmailAddress
          )
          .pipe(
            catchError((error) => {
              this.snackbar.open(
                error.error?.message || 'Could not restore the link',
                'Dismiss',
                {
                  duration: 3000,
                  panelClass: 'error-snackbar'
                }
              );
              return EMPTY;
            })
          )
          .subscribe((_) => {
            this.newLink.emit(item);
            this.snackbar.open('Successfully restored the link', 'Dismiss', {
              duration: 3000,
              panelClass: 'success-snackbar'
            });
          });
      }
    });
  }
}
