import { Component, OnInit, Input } from '@angular/core';
import { DetailsViewModel } from '../search-result.component';
import {
  getValueForKey,
  getPidUriForHref,
  getUriForKey
} from '../../../shared/operators/document-operators';
import { Select } from '@ngxs/store';
import { SearchState } from '../../../state/search.state';
import { Observable } from 'rxjs';
import { LogService } from '../../../shared/services/log.service';
import { Constants } from '../../../shared/constants';
import { MatDialog } from '@angular/material/dialog';
import { LinkedResourceDisplayDialogComponent } from '../../linked-resource-dialog/linked-resource-display-dialog.component';
import { IconTypes } from '../../../shared/icons/models/icon-types';

@Component({
  selector: 'app-search-result-link-type',
  templateUrl: './search-result-link-type.component.html',
  styleUrls: ['./search-result-link-type.component.scss']
})
export class SearchResultLinkTypeComponent implements OnInit {
  @Input() resource: DetailsViewModel[];
  @Input() linkType: DetailsViewModel[];
  @Input() metadata: any;
  @Input() lastElement: boolean;
  @Input() inbound: boolean;
  @Input() edge: string;
  @Select(SearchState.getSearchText) searchTextObservable$: Observable<string>;
  @Select(SearchState.getSearchTimestamp)
  searchTimestampObservable$: Observable<Date>;

  pidUrl: string;
  pidUrlForHref: string;
  label: string;
  definition: string;
  type: string;
  description: string;
  edgeLabel: string;
  S3: IconTypes = IconTypes.S3;
  searchText: string;
  searchTimestamp: Date;

  constructor(
    private logger: LogService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    if (this.metadata) {
      this.description = this.metadata.description;
    }
    this.edgeLabel = this.metadata[this.edge].properties[Constants.Shacl.Name];
    this.label = getValueForKey(this.linkType, Constants.Metadata.HasLabel)[0];
    this.pidUrl = getValueForKey(
      this.linkType,
      Constants.Metadata.HasPidUri
    )[0];
    this.pidUrlForHref = getPidUriForHref(this.linkType)[0];
    this.definition = getValueForKey(
      this.linkType,
      Constants.Metadata.HasResourceDefinition
    )[0];
    this.type = getUriForKey(this.linkType, Constants.Metadata.EntityType)[0];

    this.searchTextObservable$.subscribe((searchText) => {
      this.searchText = searchText;
    });

    this.searchTimestampObservable$.subscribe((searchTimestamp) => {
      this.searchTimestamp = searchTimestamp;
    });
  }

  onLinkClicked(event: Event): void {
    event.preventDefault();
    this.logger.info('DMP_RESULT_PAGE_RESOURCE_LINKED_RESOURCE_LINK_CLICKED', {
      searchText: this.searchText,
      searchTimestamp: this.searchTimestamp,
      resourcePIDUri: getPidUriForHref(this.resource)[0],
      resourceLastChangeDate: getValueForKey(
        this.resource,
        Constants.Metadata.LastChangeDateTime
      )[0],
      clickedLink: this.pidUrlForHref,
      clickedLinkEdge: Constants.Metadata.HasPidUri,
      clickedLinkType: this.linkType.find(
        (d) => d.key === Constants.Metadata.EntityType
      ).valueEdge[0],
      linkedResourceEdge:
        this.metadata[this.edge].properties[Constants.Metadata.HasPidUri],
      clickedLinkCategory: Constants.Shacl.Groups.LinkTypes
    });

    this.dialog.open(LinkedResourceDisplayDialogComponent, {
      data: { id: this.pidUrlForHref }
    });
  }
}
