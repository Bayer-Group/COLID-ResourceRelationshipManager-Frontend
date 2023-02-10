import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourceApiService } from '../../core/resource.api.service';
import { LinkHistoryDto } from '../models/link-history-dto';
import { SharedModule } from '../shared.module';
import { MatDialog } from '@angular/material/dialog';
import { IconTypes } from '../icons/models/icon-types';
import { MatTable } from '@angular/material/table';
import { Sort } from '@angular/material/sort';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';
import { AuthService } from '../../modules/authentication/services/auth.service';
import { catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface HistoryItemTableEntry {
  linkType: {
    key: string;
    value: string;
  };
  outbound: boolean;
  source: string;
  sourceName: string;
  sourceType: string;
  target: string;
  targetName: string;
  targetType: string;
  deletedBy: string;
  deletedAt: string;
}

@Component({
  selector: 'colid-link-history-dialog',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './link-history-dialog.component.html',
  styleUrls: ['./link-history-dialog.component.scss'],
})
export class LinkHistoryDialogComponent implements OnInit {
  isLoading: boolean = true;
  inputSearchEnabled: boolean = false;
  currentInputFilter: string = '';
  currentSorting: { column: string; sortDirection: string } = {
    column: '',
    sortDirection: '',
  };
  historyItemsSource: HistoryItemTableEntry[];
  historyItems: HistoryItemTableEntry[];
  S3: IconTypes = IconTypes.S3;

  @ViewChild('linkHistoryTable') table!: MatTable<HistoryItemTableEntry>;

  displayedColumns = [
    'outbound',
    'targetType',
    'linkType',
    'targetName',
    'deletedBy',
    'deletedAt',
    'restoreAction',
  ];

  @Input() resourcePidUri: string;

  @Output()
  newLink: EventEmitter<HistoryItemTableEntry> =
    new EventEmitter<HistoryItemTableEntry>();

  constructor(
    private resourceApiService: ResourceApiService,
    private dialog: MatDialog,
    private auth: AuthService,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.resourceApiService
      .getLinkHistory(this.resourcePidUri)
      .subscribe((historyItems: LinkHistoryDto[]) => {
        this.isLoading = false;
        this.historyItemsSource = historyItems.map(
          (item) =>
            <HistoryItemTableEntry>{
              linkType: {
                key: item.linkType,
                value: item.linkTypeLabel,
              },
              outbound: !item.inBound,
              source: item.linkStartResourcePidUri,
              sourceName: item.linkStartResourceLabel,
              sourceType: item.linkStartResourceType,
              target: item.linkEndResourcePidUri,
              targetName: item.linkEndResourceLabel,
              targetType: item.linkEndResourceType,
              deletedBy: item.deletedBy,
              deletedAt: item.dateDeleted,
            }
        );
        this.historyItems = [...this.historyItemsSource];
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
    this.table.renderRows();
  }

  applySorting(sortColumn: string, sortDirection: string) {
    if (sortDirection === '') {
      this.historyItems = this.historyItemsSource.slice();
    } else {
      this.historyItems.sort((a, b) => {
        let result = 0;

        if (sortColumn === 'outbound') {
          result = Number(a.outbound) - Number(b.outbound);
        }

        if (sortColumn === 'targetType') {
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
          const firstLinkType = a.linkType.value.toUpperCase();
          const secondLinkType = b.linkType.value.toUpperCase();
          if (firstLinkType < secondLinkType) {
            result = -1;
          }
          if (firstLinkType > secondLinkType) {
            result = 1;
          }
        }

        if (sortColumn === 'deletedBy') {
          const firstAuthor = a.deletedBy.toUpperCase();
          const secondAuthor = b.deletedBy.toUpperCase();
          if (firstAuthor < secondAuthor) {
            result = -1;
          }
          if (firstAuthor > secondAuthor) {
            result = 1;
          }
        }

        if (sortColumn === 'deletedAt') {
          const firstDeletedAt = new Date(a.deletedAt);
          const secondDeletedAt = new Date(b.deletedAt);
          result = firstDeletedAt.getTime() - secondDeletedAt.getTime();
        }

        if (sortDirection === 'desc') {
          result *= -1;
        }

        return result;
      });
    }
  }

  onInputChange(event) {
    this.currentInputFilter = event.target.value;
    this.applyFilter(this.currentInputFilter);
    if (this.currentSorting.column) {
      this.applySorting(
        this.currentSorting.column,
        this.currentSorting.sortDirection
      );
      this.table.renderRows();
    }
  }

  applyFilter(searchString: string) {
    if (searchString) {
      this.historyItems = this.historyItemsSource.filter((item) =>
        item.outbound
          ? item.targetName
              .toLowerCase()
              .includes(searchString.trim().toLowerCase())
          : item.sourceName
              .toLowerCase()
              .includes(searchString.trim().toLowerCase())
      );
    } else {
      this.historyItems = this.historyItemsSource.slice();
      this.inputSearchEnabled = false;
    }
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
        `,
      },
      width: 'auto',
      disableClose: true,
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
                  panelClass: 'error-snackbar',
                }
              );
              return EMPTY;
            })
          )
          .subscribe((_) => {
            this.newLink.emit(item);
            this.snackbar.open('Successfully restored the link', 'Dismiss', {
              duration: 3000,
              panelClass: 'success-snackbar',
            });
          });
      }
    });
  }
}
