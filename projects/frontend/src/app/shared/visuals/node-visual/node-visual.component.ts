import { AfterViewInit, Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { Node } from '../../../core/d3';
import { IconTypes } from '../../icons/models/icon-types';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ColumnSchemaInformation } from '../../models/schema-information';
import { PidApiService } from '../../../core/http/pid-api.service';
import { ToggleExclusive, ToggleSelection } from '../../../state/graph-data.state';
import { Select, Store } from '@ngxs/store';
import { AddLinkableNode, GraphLinkingData, GraphLinkingDataState } from '../../../state/graph-linking.state';
import { GraphProperties, GraphVisualisationState, SetDetailedResourceUri, ShowDetailSidebar } from '../../../state/graph-visualisation.state';

@Component({
  selector: '[nodeVisual]',
  templateUrl: './node-visual.component.html',
  styleUrls: ['./node-visual.component.css']
})
export class NodeVisualComponent implements AfterViewInit, OnDestroy {
  @Input('nodeVisual') node!: Node;
  @Input('showLongResourceName') showLongResourceName!: boolean;

  @ViewChild('nodeLabel') textLabel!: any;

  width: number = 180;
  height: number = 40;

  @Select(GraphLinkingDataState.getGraphLinkingState) private linkingProperties$: Observable<GraphLinkingData>;
  @Select(GraphVisualisationState.getGraphVisualisationState) private graphData$: Observable<GraphProperties>;

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
  ctrlPressed: boolean = false;

  masterSub: Subscription = new Subscription();

  constructor(
    private store: Store,
    private pidApi: PidApiService) {
    this.masterSub.add(this.linkingProperties$.pipe(
      tap(
        linking => {
          this.linkingModeEnabled = linking.linkingModeEnabled;
          this.linkingModeQueue = linking.linkNodes;
          this.inLinkingSelection = linking.linkNodes.findIndex(l => l.id == this.node.id) > -1;
        }
      )
    ).subscribe());

    //Listener for changes in the graph store and set filter accordingly
    this.masterSub.add(this.graphData$.subscribe(
      data => {
        this.ctrlPressed = data.ctrlPressed;
        //filter out self if filter mode is enabled
        if (data.filterViewEnabled) {
          if (this.filterOutTypes.includes(this.node.resourceTypeId)) {
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
    ));
  }
  ngAfterViewInit(): void {
    this.node.width = this.width;
    this.node.height = this.height;

    // Collect related column/table uri's
    //TODO EUCAV: Move this to a central space to centralize and bundle the calls
    this.masterSub.add(this.pidApi.getSchemaInfo(this.node.id).subscribe(
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
    ));
  }

  ngOnDestroy(): void {
    this.masterSub.unsubscribe();
  }

  nodeClicked(event: any) {
    this.isSingleClick = true;
    if (!this.linkingModeEnabled) {
      setTimeout(() => {
        if (this.isSingleClick) {
          if (this.ctrlPressed) {
            this.store.dispatch(new ToggleSelection(this.node.id))
          } else {
            this.store.dispatch(new ToggleExclusive(this.node.id));
          }
        }
      }, 250)
    } else {
      if (this.linkingModeQueue.findIndex(n => n.id == this.node.id) == -1) {
        this.store.dispatch(new AddLinkableNode(JSON.parse(JSON.stringify(this.node))));
      }
    }
  }

  openDetails() {
    this.isSingleClick = false;
    this.store.dispatch(new SetDetailedResourceUri(this.node.id));
    this.store.dispatch(new ShowDetailSidebar());
  }
}
