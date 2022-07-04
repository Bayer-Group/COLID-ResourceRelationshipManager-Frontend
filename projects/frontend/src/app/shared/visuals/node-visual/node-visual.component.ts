import { AfterViewInit, Component, ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Store } from '@ngrx/store';
import { Node } from '../../../core/d3';
import { GraphState } from '../../../state/store-items';
import { IconTypes } from '../../icons/models/icon-types';
import * as graphActions from '../../../state/graph-visualisation/graph-visualisation.actions';
import * as graphLinkingActions from '../../../state/graph-linking/graph-linking.actions';
import { GraphLinkingData } from '../../../state/graph-linking/graph-linking.model';
import { GraphProperties } from '../../../state/graph-visualisation/graph-visualisation.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ResourceRelationshipManagerService } from '../../../core/http/resource-relationship-manager.service';
import { ColumnSchemaInformation } from '../../models/schema-information';
import { PidApiService } from '../../../core/http/pid-api.service';
import { NotificationService } from '../../services/notification.service';


@Component({
  selector: '[nodeVisual]',
  templateUrl: './node-visual.component.html',
  styleUrls: ['./node-visual.component.css']
})
export class NodeVisualComponent implements AfterViewInit {
  @Input('nodeVisual') node!: Node;
  @Input('showLongResourceName') showLongResourceName!: boolean;

  @ViewChild('nodeLabel') textLabel!: any;

  width: number = 180;
  height: number = 40;

  private linkingProperties$: Observable<GraphLinkingData>;
  private graphData$: Observable<GraphProperties> | undefined;

  S3: IconTypes = IconTypes.S3;
  Default: IconTypes = IconTypes.Default;
  Mapping: IconTypes = IconTypes.Mapping;
  nodeBackgroundColor: string = "white";
  isSingleClick: boolean = true;
  filterInfo = {
    isFiltered: false,
    filterCount: 0,
    filterItems: Array<ColumnSchemaInformation>()
  };
  linkingModeEnabled: boolean = false;
  linkingModeQueue: Node[] = [];
  inLinkingSelection: boolean = false;
  displayNode: boolean = true;
  filterOutTypes: string[] = ["https://pid.bayer.com/kos/19050/444586", "https://pid.bayer.com/kos/19050/444582"]

  flattenedColumns: ColumnSchemaInformation[] = [];

  constructor(
    private store: Store<GraphState>,
    private pidApi: PidApiService) {
    this.linkingProperties$ = this.store.select('graphLinking');
    this.linkingProperties$.pipe(
      tap(
        linking => {
          this.linkingModeEnabled = linking.linkingModeEnabled;
          this.linkingModeQueue = linking.linkNodes;
          this.inLinkingSelection = linking.linkNodes.findIndex(l => l.id == this.node.id) > -1;
        }
      )
    ).subscribe();

    //Listener for changes in the graph store and set filter accordingly
    this.graphData$ = this.store.select('graphVisualisation');
    this.graphData$.subscribe(
      data => {
        if (data.filterViewEnabled) {
          if (this.filterOutTypes.includes(this.node.resourceType)) {
            this.displayNode = false;
            return
          }
        }
        if (data.schemaFilterUris.length > 0 && data.filterViewEnabled) {
          this.filterInfo.filterCount = 0
          this.filterInfo.filterItems = []
          this.flattenedColumns.forEach(item => {
            if (data.schemaFilterUris.includes(item.uri)) {
              item.display = true
              this.filterInfo.isFiltered = true
              if (!this.filterInfo.filterItems.includes(item)) {
                this.filterInfo.filterItems.push(item)
                this.filterInfo.filterCount++
              }
            } else {
              item.display = false
              if (this.filterInfo.filterItems.includes(item)) {
                this.filterInfo.filterItems = this.filterInfo.filterItems.filter(entry => entry != item)
                if (this.filterInfo.filterCount < 0) {
                  this.filterInfo.isFiltered = false
                }
              }
            }
          })
        } else {
          this.filterInfo.isFiltered = false
          this.filterInfo.filterCount = 0
          this.filterInfo.filterItems = []
          this.displayNode = true;
        }
      }
    )
  }

  ngAfterViewInit(): void {
    this.node.width = this.width;
    this.node.height = this.height;

    // Collect related column/table uri's
    this.pidApi.getSchemaInfo(this.node.resourceIdentifier).subscribe(
      res => {
        let consolidatedUris: string[] = [];
        res.columns.forEach(c => {
          this.flattenedColumns.push({ display: false, uri: c.pidURI, name: c.label });
        });
        res.tables.forEach(t => {
          t.linkedTableFiled.forEach(tc => {
            this.flattenedColumns.push({ display: false, uri: tc.pidURI, name: tc.label });
          })
        });
      }
    );
  }

  nodeClicked(event: any) {
    this.isSingleClick = true;
    if (!this.linkingModeEnabled) {
      setTimeout(() => {
        if (this.isSingleClick) {
          this.node.selected = !this.node.selected
        }
      }, 250)
    } else {
      if (this.linkingModeQueue.findIndex(n => n.id == this.node.id) == -1) {
        this.store.dispatch(graphLinkingActions.AddLinkableNode({ node: JSON.parse(JSON.stringify(this.node)) }));
      }
    }
  }

  openDetails() {
    this.isSingleClick = false;
    this.store.dispatch(graphActions.SetDetailedResourceUri({ pidUri: this.node.resourceIdentifier }));
    this.store.dispatch(graphActions.ShowDetailSidebar());
  }
}
