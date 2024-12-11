import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnInit,
  Input,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import { Node } from '../../../core/d3';
import { IconTypes } from '../../icons/models/icon-types';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  ToggleExclusive,
  ToggleSelection
} from '../../../state/graph-data.state';
import { Select, Store } from '@ngxs/store';
import {
  AddLinkableNode,
  GraphLinkingData,
  GraphLinkingDataState
} from '../../../state/graph-linking.state';
import {
  GraphProperties,
  GraphVisualisationState,
  SetDetailedResourceUri,
  ShowDetailSidebar
} from '../../../state/graph-visualisation.state';
import { Constants } from '../../constants';

@Component({
  selector: '[nodeVisual]',
  templateUrl: './node-visual.component.html',
  styleUrls: ['./node-visual.component.css']
})
export class NodeVisualComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input('nodeVisual') node!: Node;
  @Input() showLongResourceName!: boolean;

  @ViewChild('nodeLabel') textLabel!: any;

  @Output() doubleClickXPosition: EventEmitter<number> =
    new EventEmitter<number>();

  width: number = 180;
  height: number = 40;

  @Select(GraphLinkingDataState.getGraphLinkingState)
  private linkingProperties$: Observable<GraphLinkingData>;
  @Select(GraphVisualisationState.getGraphVisualisationState)
  private graphData$: Observable<GraphProperties>;

  S3: IconTypes = IconTypes.S3;
  nodeBackgroundColor: string = 'white';
  isSingleClick: boolean = true;
  linkingModeEnabled: boolean = false;
  linkingModeQueue: Node[] = [];
  inLinkingSelection: boolean = false;
  displayNode: boolean = true;
  filterOutTypes: string[] = [
    Constants.ResourceTypes.Table,
    Constants.ResourceTypes.Column
  ];
  ctrlPressed: boolean = false;

  masterSub: Subscription = new Subscription();

  constructor(private store: Store) {
    this.masterSub.add(
      this.linkingProperties$
        .pipe(
          tap((linking) => {
            this.linkingModeEnabled = linking.linkingModeEnabled;
            this.linkingModeQueue = linking.linkNodes;
            this.inLinkingSelection =
              linking.linkNodes.findIndex((l) => l.id == this.node.id) > -1;
          })
        )
        .subscribe()
    );
  }

  ngOnInit() {
    //Listener for changes in the graph store and set filter accordingly
    this.masterSub.add(
      this.graphData$.subscribe((data) => {
        this.ctrlPressed = data.ctrlPressed;
        //filter out self if filter mode is enabled
        if (data.filterViewEnabled) {
          if (this.filterOutTypes.includes(this.node.resourceTypeId)) {
            this.displayNode = false;
            return;
          }
        } else {
          this.displayNode = true;
        }
      })
    );
  }

  ngAfterViewInit(): void {
    this.node.width = this.width;
    this.node.height = this.height;
  }

  ngOnDestroy(): void {
    this.masterSub.unsubscribe();
  }

  nodeClicked(_) {
    this.isSingleClick = true;
    if (!this.linkingModeEnabled) {
      setTimeout(() => {
        if (this.isSingleClick) {
          if (this.ctrlPressed) {
            this.store.dispatch(new ToggleSelection(this.node.id));
          } else {
            this.store.dispatch(new ToggleExclusive(this.node.id));
          }
        }
      }, 250);
    } else {
      if (this.linkingModeQueue.findIndex((n) => n.id == this.node.id) == -1) {
        this.store.dispatch(
          new AddLinkableNode(JSON.parse(JSON.stringify(this.node)))
        );
      }
    }
  }

  openDetails(event) {
    this.doubleClickXPosition.emit(event.clientX);
    this.isSingleClick = false;
    this.store.dispatch(new SetDetailedResourceUri(this.node.id));
    this.store.dispatch(new ShowDetailSidebar());
  }
}
