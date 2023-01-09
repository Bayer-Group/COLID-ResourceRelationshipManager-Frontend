
import { DatePipe } from '@angular/common';
import { Component, Input, OnChanges, OnInit, OnDestroy, SimpleChanges, ChangeDetectorRef, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { Observable, forkJoin, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DocumentService } from './../../services/document.service';
import { Constants } from '../../../shared/constants';
import { SchemaUIResult, SchemeUi, SchemeUiResult } from '../../../shared/schemeUI';
import { DocumentMap, Metadata, SearchHit } from '../../../shared/search-result';
import { MetadataState } from './../../../state/metadata.state';
import { RRMState } from '../../../state/rrm.state';
import { FetchSchemaUIResults, SearchState } from '../../../state/search.state';
import { LinkedResourceDisplayDialog } from '../../linked-resource-dialog/linked-resource-display-dialog.component';
import { IconTypes } from '../../icons/models/icon-types';
//import { test } from '../scheme-ui.worker';

@Component({
  selector: 'app-scheme-ui',
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './scheme-ui.component.html',
  styleUrls: ['./scheme-ui.component.scss'],

})
export class SchemeUIComponent implements OnInit, OnChanges, OnDestroy {

  @Input() schemeUiDetail: SchemeUi;
  @Input() metadata: any[];
  metaDataType: any;
  schemeDoc: SchemeUiResult;
  @Select(MetadataState.getMetadataTypes) metaDataType$: Observable<any>;
  @Select(SearchState.getLoading) loading$: Observable<boolean>;
  @Select(SearchState.getErrorSchema) errorSchema$: Observable<any>;
  @Select(SearchState.getschemaUIDetailResource) SchemaUiDetail$: Observable<any>;
  @Select(RRMState.getFromRRM) fromRRM$: Observable<boolean>;
  @Select(RRMState.getFilterMode) filterMode$: Observable<boolean>;
  @Select(RRMState.getSourceDialog) sourceDialog$: Observable<string>;
  showCheckbox: boolean = false;
  fromRRM: boolean = false;
  filterMode: boolean = false;
  sourceDialog: string = "addResource";
  panelOpenState = false;
  expanded = false;
  selectedPIDURIs: string[] = [];
  columnNames: any[];
  columnOrderBy: any[] = [];
  columnLength: number = 0;
  dataSource: any = [];
  tables: any[] = [];
  linkedColumn: any[] = [];
  columnNormalMode: any[];
  columnAfterFiltermode: any[] = ['https://pid.bayer.com/kos/19050/hasLabel'];
  S3: IconTypes = IconTypes.S3;

  icon = "https://pid.bayer.com/kos/19050/444586";
  dateCreated = "https://pid.bayer.com/kos/19050/dateCreated";
  lastChnagedByDate = "https://pid.bayer.com/kos/19050/lastChangeDateTime";
  nameColumn = "https://pid.bayer.com/kos/19050/hasLabel";
  orderNumber = "http://www.w3.org/ns/shacl#order";
  masterSub: Subscription = new Subscription();

  constructor(private datePipe: DatePipe,
    private store: Store, private dialog: MatDialog) {
    this.masterSub.add(this.fromRRM$.pipe(
      tap(s => {
        this.fromRRM = (s == null || typeof s == 'undefined' ? false : s);
        this.updateHideCheckbox();
      })
    ).subscribe());
    this.masterSub.add(this.filterMode$.pipe(tap(f => { this.filterMode = f; this.updateHideCheckbox(); })).subscribe());
    this.masterSub.add(this.sourceDialog$.pipe(tap(s => { this.sourceDialog = s; this.updateHideCheckbox(); })).subscribe());


  }

  updateHideCheckbox() {
    this.showCheckbox = this.fromRRM && this.filterMode && this.sourceDialog == "detailSidebar";
  }

  selectedPidUriCurrent: string = "";
  indexCurrent: number = 0;
  documents: DocumentMap[] = [];
  searchHits: SearchHit[] = [];
  schemeUiValues: SchemeUi
  schemaUIResult: SchemaUIResult
  loadingstatus: boolean = false;
  error: string = null;
  schemaStatus: boolean = true;
  schemaStatusChecked: boolean = false;
  selectedPidURIs: string[] = [];

  ngOnInit(): void {
    this.masterSub.add(this.metaDataType$.subscribe(metadatatype => {
      this.metaDataType = metadatatype;
    }));

    this.masterSub.add(this.errorSchema$.subscribe(error => {
      if (error) {
        if (error.status == 404) {
          this.error = "The selected COLID entry could not be found. It may not yet be published to the Data Marketplace."
        } else {
          this.error = "An unknown error has occurred."
        }
      }
    }));

    this.masterSub.add(this.loading$.subscribe(result => {
      this.loadingstatus = result;
    }));


  }

  onResultClicked(expanded): void {
    this.expanded = !expanded;
  }

  checkboxChanged(event: any) {
    if (event.source.checked) {

      this.selectedPIDURIs.push(event.source.value);
      window.parent.postMessage({ message: "selectedPidURIs", value: this.selectedPIDURIs }, "*");

    }
    else {
      this.selectedPIDURIs = this.selectedPIDURIs.filter(item => item != event.source.value);
      window.parent.postMessage({ message: "selectedPidURIs", value: this.selectedPIDURIs }, "*");

    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["schemeUiDetail"] && changes["schemeUiDetail"].currentValue) {

      //this.schemaStatusChecked=true;
      this.schemeUiValues = new SchemeUi();
      this.schemeUiValues = changes["schemeUiDetail"].currentValue;
      var result = this.schemeUiValues
      this.schemaStatus = (result?.columns.length > 0 || result?.tables.length > 0) ? true : false;
      this.schemaStatusChecked = !this.schemaStatus

      if (this.schemeUiValues && (this.schemeUiValues.columns.length > 0 || this.schemeUiValues.tables.length > 0)) {
        this.masterSub.add(this.store.dispatch(new FetchSchemaUIResults(this.schemeUiValues)).subscribe(result => {
          if (result && result.search && result.search.schemaUIDetail) {
            this.schemaUIResult = result.search.schemaUIDetail;
            setTimeout(() => {
              this.columnSchemeUi();
              this.tableSchemeUi();
            }, 0)
          }
        }, error => {
          console.log(error);
        }));
      }

    }

  }

  rowResult(row, columnName, element) {
    const pidUri: string = element["http://pid.bayer.com/kos/19014/hasPID"].outbound[0].value;
    if (row && row.outbound && row.outbound.length > 0) {
      if (columnName == this.dateCreated || columnName == this.lastChnagedByDate) {
        return [this.datePipe.transform(row.outbound[0].value, 'yyyy-MM-dd hh:mm')]
      }
      if (columnName == this.nameColumn) {
        return [`<a href="${pidUri}" (click)="clickColumn($event, '${pidUri}')">${row.outbound[0].value}</a href>`];
      }
      return [row.outbound[0].value];

    }
    return [""]
  }

  columnSchemeUi() {
    var colResult = this.schemaUIResult
    if (colResult && colResult.columns && colResult.columns.length > 0) {
      this.flattenSubcolumns([...colResult.columns], this.dataSource, 0, false)
      this.columnNamePolulate(this.dataSource[0]);
    } else {
      this.loadingstatus = false;
    }
  }

  flattenSubcolumns(data, outputArray, index, sub) {
    if (Array.isArray(data)) {
      data.forEach((element) => {
        if (element.hasSubColumns && element.hasSubColumns.length > 0) {
          element.isSub = sub
          element.subIndex = index
          outputArray.push(element)
          let newIndex = index + 1
          this.flattenSubcolumns(element.hasSubColumns, outputArray, newIndex, true);
        } else {
          element.isSub = sub
          element.subIndex = index
          outputArray.push(element);
        }
      }, this
      )
    } else {
      data.isSub = sub
      data.subIndex = index
      outputArray.push(data)
    };
  }

  clickTable(event: Event, table: any) {
    event.preventDefault();
    var pidUri = table['http://pid.bayer.com/kos/19014/hasPID'].outbound[0].value;
    this.dialog.open(LinkedResourceDisplayDialog, {
      data: { id: pidUri }
    });
  }

  clickColumn(event: Event, pidUri: string) {
    event.preventDefault();
    this.dialog.open(LinkedResourceDisplayDialog, {
      data: { id: pidUri }
    });
  }

  tableSchemeUi() {
    var tableResult = this.schemaUIResult;
    if (tableResult && tableResult.tables && tableResult.tables.length > 0) {
      this.tables = [...tableResult.tables]
      tableResult.tables.forEach(x => {
        let columnHolder = []
        if (x.linkedColumnResourceDetail && x.linkedColumnResourceDetail.length > 0) {
          this.flattenSubcolumns(x.linkedColumnResourceDetail, columnHolder, 0, false)
        }
        this.linkedColumn.push([columnHolder])
      });
      var columndetail = tableResult.tables.find(x => x.linkedColumnResourceDetail.length > 0);
      if (columndetail && columndetail.linkedColumnResourceDetail && columndetail.linkedColumnResourceDetail.length > 0) {
        this.columnNamePolulate(columndetail.linkedColumnResourceDetail[0]);
      }
    } else {
      this.loadingstatus = false;
    }
  }


  orderByColumn(columnName) {
    if (this.metadata[columnName]) {
      if (columnName == "http://pid.bayer.com/kos/19050/LinkTypes" || columnName == "https://pid.bayer.com/kos/19050/distribution") {
        return "";
      }
      var name = this.metadata[columnName].properties[Constants.Shacl.Name]
      var piduri = columnName
      var order = this.metadata[columnName].properties[Constants.Shacl.Order]
      var group = this.metadata[columnName].properties[Constants.Shacl.Group]
      var obj = { name, order, piduri, group };
      return obj;
    }
    return "";
  }


  columnNamePolulate(column) {
    if (!this.columnNames) {
      var orderBy = []
      var colName = Object.keys(column);
      colName.forEach(name => {
        if (this.orderByColumn(name)) {
          orderBy.push(this.orderByColumn(name))
        }
      });
      var columnOrderBy = orderBy.sort((a, b) => { return a.group.order - b.group.order });
      this.columnNames = columnOrderBy.map(x => x.piduri);
    }
  }

  ngOnDestroy() {
    this.masterSub.unsubscribe();
  }
}