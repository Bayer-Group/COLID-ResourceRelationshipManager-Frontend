import { DatePipe } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { Constants } from '../../../shared/constants';
import { SchemaUIResult, SchemeUi } from '../../../shared/models/schemeUI';
import { MetadataState } from './../../../state/metadata.state';
import { FetchSchemaUIResults, SearchState } from '../../../state/search.state';
import { LinkedResourceDisplayDialogComponent } from '../../linked-resource-dialog/linked-resource-display-dialog.component';
import { IconTypes } from '../../../shared/icons/models/icon-types';
import { skip } from 'rxjs/operators';

@Component({
  selector: 'app-scheme-ui',
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './scheme-ui.component.html',
  styleUrls: ['./scheme-ui.component.scss'],
})
export class SchemeUIComponent implements OnInit, OnDestroy {
  @Input() set schemeUiDetail(schemeUI) {
    this.schemeUiValues = new SchemeUi();
    this.schemeUiValues = schemeUI;
    let result = this.schemeUiValues;
    this.schemaStatus =
      result?.columns.length > 0 || result?.tables.length > 0 ? true : false;
    this.schemaStatusChecked = !this.schemaStatus;

    this.linkedColumn = [];
    this.dataSource = [];
    this.tables = [];

    if (
      this.schemeUiValues &&
      (this.schemeUiValues.columns.length > 0 ||
        this.schemeUiValues.tables.length > 0)
    ) {
      this.store.dispatch(new FetchSchemaUIResults(this.schemeUiValues));
    }
  }
  @Input() metadata: any[];
  @Output() resetSchemeUi = new EventEmitter<void>();
  metaDataType: any;
  masterSub: Subscription = new Subscription();
  @Select(MetadataState.getMetadataTypes) metaDataType$: Observable<any>;
  @Select(SearchState.getLoading) loading$: Observable<boolean>;
  @Select(SearchState.getErrorSchema) errorSchema$: Observable<any>;
  @Select(SearchState.getschemaUIDetailResource)
  SchemaUiDetail$: Observable<any>;
  columnNames: any[];
  columnOrderBy: any[] = [];
  columnLength: number = 0;
  dataSource: any = [];
  tables: any[] = [];
  linkedColumn: any[] = [];
  columnNormalMode: any[];
  columnAfterFiltermode: any[] = [Constants.Metadata.HasLabel];
  S3: IconTypes = IconTypes.S3;

  icon = Constants.ResourceTypes.Table;
  dateCreated = Constants.Metadata.DateCreated;
  lastChnagedByDate = Constants.Metadata.LastChangeDateTime;
  nameColumn = Constants.Metadata.HasLabel;
  orderNumber = Constants.Shacl.Order;
  someDataSubscription: any;
  hasPIDURI = Constants.Metadata.HasPidUri;
  hasResourceDefinition = Constants.Metadata.HasResourceDefinition;
  author = Constants.Metadata.Author;

  constructor(
    private datePipe: DatePipe,
    private store: Store,
    private dialog: MatDialog
  ) {}

  schemeUiValues: SchemeUi;
  schemaUIResult: SchemaUIResult;
  loadingstatus: boolean = false;
  error: string = null;
  schemaStatus: boolean = true;
  schemaStatusChecked: boolean = false;

  ngOnInit(): void {
    this.masterSub.add(
      this.metaDataType$.subscribe((metadatatype) => {
        this.metaDataType = metadatatype;
      })
    );

    this.masterSub.add(
      this.errorSchema$.subscribe((error) => {
        if (error) {
          if (error.status == 404) {
            this.error =
              'The selected COLID entry could not be found. It may not yet be published to the Data Marketplace.';
          } else {
            this.error = 'An unknown error has occurred.';
          }
        }
      })
    );
    this.masterSub.add(
      this.SchemaUiDetail$.pipe(skip(1)).subscribe((schemaUI) => {
        if (schemaUI) {
          this.schemaUIResult = schemaUI;
          this.columnSchemeUi();
          this.tableSchemeUi();
        }
      })
    );

    this.masterSub.add(
      this.loading$.subscribe((result) => {
        this.loadingstatus = result;
      })
    );
  }

  onResultClicked(index: number): void {
    this.tables[index].expanded = !this.tables[index].expanded;
  }

  rowResult(row, columnName, element) {
    const pidUri: string = element[this.hasPIDURI].outbound[0].value;
    if (row && row.outbound && row.outbound.length > 0) {
      if (
        columnName == this.dateCreated ||
        columnName == this.lastChnagedByDate
      ) {
        return [
          this.datePipe.transform(row.outbound[0].value, 'yyyy-MM-dd hh:mm'),
        ];
      }
      if (columnName == this.nameColumn) {
        return [
          `<a href="${pidUri}" (click)="clickColumn($event, '${pidUri}')">${row.outbound[0].value}</a href>`,
        ];
      }
      return [row.outbound[0].value];
    }
    return [''];
  }

  columnSchemeUi() {
    let colResult = this.schemaUIResult;
    if (colResult && colResult.columns && colResult.columns.length > 0) {
      this.flattenSubcolumns([...colResult.columns], this.dataSource, 0, false);
      this.columnNamePolulate(this.dataSource[0]);
    } else {
      this.loadingstatus = false;
    }
  }

  flattenSubcolumns(data, outputArray, index, sub) {
    if (Array.isArray(data)) {
      data.forEach((element) => {
        if (element.hasSubColumns && element.hasSubColumns.length > 0) {
          element.isSub = sub;
          element.subIndex = index;
          outputArray.push(element);
          let newIndex = index + 1;
          this.flattenSubcolumns(
            element.hasSubColumns,
            outputArray,
            newIndex,
            true
          );
        } else {
          element.isSub = sub;
          element.subIndex = index;
          outputArray.push(element);
        }
      }, this);
    } else {
      data.isSub = sub;
      data.subIndex = index;
      outputArray.push(data);
    }
  }

  clickTable(event: Event, table: any) {
    event.preventDefault();
    var pidUri = table[this.hasPIDURI].outbound[0].value;
    this.dialog.open(LinkedResourceDisplayDialogComponent, {
      data: { id: pidUri, confirmReview: false },
    });
  }

  clickColumn(event: Event, pidUri: string) {
    event.preventDefault();
    this.dialog.open(LinkedResourceDisplayDialogComponent, {
      data: { id: pidUri, confirmReview: false },
    });
  }

  tableSchemeUi() {
    let tableResult = this.schemaUIResult;
    if (tableResult && tableResult.tables && tableResult.tables.length > 0) {
      this.tables = tableResult.tables.map((t) => ({ ...t, expanded: false }));
      tableResult.tables.forEach((x) => {
        let columnHolder = [];
        if (
          x.linkedColumnResourceDetail &&
          x.linkedColumnResourceDetail.length > 0
        ) {
          this.flattenSubcolumns(
            x.linkedColumnResourceDetail,
            columnHolder,
            0,
            false
          );
        }
        this.linkedColumn.push([columnHolder]);
      });

      var columndetail = tableResult.tables.find(
        (x) => x.linkedColumnResourceDetail.length > 0
      );
      if (
        columndetail &&
        columndetail.linkedColumnResourceDetail &&
        columndetail.linkedColumnResourceDetail.length > 0
      ) {
        this.columnNamePolulate(columndetail.linkedColumnResourceDetail[0]);
      }
    } else {
      this.loadingstatus = false;
    }
  }

  orderByColumn(columnName) {
    if (this.metadata[columnName]) {
      if (
        columnName == Constants.Shacl.Groups.LinkTypes ||
        columnName == Constants.DistributionEndpoint.DistributionEndpointKey
      ) {
        return '';
      }
      var name = this.metadata[columnName].properties[Constants.Shacl.Name];
      var piduri = columnName;
      var order = this.metadata[columnName].properties[Constants.Shacl.Order];
      var group = this.metadata[columnName].properties[Constants.Shacl.Group];
      var obj = { name, order, piduri, group };
      return obj;
    }
    return '';
  }

  columnNamePolulate(column) {
    if (!this.columnNames) {
      var orderBy = [];
      var colName = Object.keys(column);
      colName.forEach((name) => {
        if (this.orderByColumn(name)) {
          orderBy.push(this.orderByColumn(name));
        }
      });
      var columnOrderBy = orderBy.sort((a, b) => {
        return a.group.order - b.group.order;
      });
      this.columnNames = columnOrderBy.map((x) => x.piduri);
    }
  }

  ngOnDestroy() {
    this.resetSchemeUi.emit();
    this.masterSub.unsubscribe();
  }
}
