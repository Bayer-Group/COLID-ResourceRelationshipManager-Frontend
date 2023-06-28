import { NgModule } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { SearchBarAutocompleteComponent } from './search-bar-autocomplete/search-bar-autocomplete.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { DistributionEndpointComponent } from './search-result/distribution-endpoint/distribution-endpoint.component';
import { SchemeUIComponent } from './search-result/scheme-ui/scheme-ui.component';
import { SearchResultAttachmentComponent } from './search-result/search-result-attachment/search-result-attachment.component';
import { SearchResultLinkTypeComponent } from './search-result/search-result-link-type/search-result-link-type.component';
import { SearchResultComponent } from './search-result/search-result.component';
import { SimilarityModalComponent } from './search-result/similarity-modal/similarity-modal.component';
import { SearchResultStandaloneContainerComponent } from './search-result-standalone-container/search-result-standalone-container.component';
import { SearchFilterDialogComponent } from './search-filter-dialog/search-filter-dialog.component';
import { SidebarComponent } from './sidebar.component/sidebar.component';
import { SearchComponent } from './search.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { RangeBoxComponent } from './filter-panel/range-box/range-box.component';
import { FilterBoxItemComponent } from './filter-panel/filter-box/filter-box-item/filter-box-item.component';
import { FilterBoxItemDaterangeComponent } from './filter-panel/filter-box/filter-box-item-daterange/filter-box-item-daterange.component';
import { FilterBoxItemSwitchComponent } from './filter-panel/filter-box/filter-box-item-switch/filter-box-item-switch.component';
import { FilterBoxItemCheckboxHierarchyComponent } from './filter-panel/filter-box/filter-box-checkboxHierarchy/filter-box-item-checkboxHierarchy.component';
import { FilterBoxComponent } from './filter-panel/filter-box/filter-box.component';
import { FilterPanelComponent } from './filter-panel/filter-panel.component';
import { FilterBoxItemTaxonomyComponent } from './filter-panel/filter-box/filter-box-item-taxonomy/filter-box-item-taxonomy.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LinkedResourceDisplayDialogComponent } from './linked-resource-dialog/linked-resource-display-dialog.component';
import { AddFavoriteDialogComponent } from './add-favorite-dialog/add-favorite-dialog.component';
import { CreateFavoriteListComponent } from './create-favorite-list/create-favorite-list.component';
import { ResourceHistoricComponent } from './resource-historic/resource-historic.component';
import { EntityDisplayComponent } from './entity-display/entity-display.component';
import { EntityDisplayItemVersioningComponent } from './entity-display/entity-display-item-versioning/entity-display-item-versioning.component';
import { EntityDisplayItemTaxonomyComponent } from './entity-display/entity-display-item-taxonomy/entity-display-item-taxonomy.component';
import { EntityDisplayImageComponent } from './entity-display/entity-display-image/entity-display-image.component';
import { EntityDisplayItemComponent } from './entity-display/entity-display-item/entity-display-item.component';
import { EntityDisplayGroupComponent } from './entity-display/entity-display-group/entity-display-group.component';
import { ImageViewerDialogComponent } from './entity-display/entity-display-image/image-viewer-dialog/image-viewer-dialog.component';

@NgModule({
  declarations: [
    SearchBarComponent,
    SearchBarAutocompleteComponent,
    SearchResultsComponent,
    DistributionEndpointComponent,
    SchemeUIComponent,
    SearchResultAttachmentComponent,
    SearchResultLinkTypeComponent,
    SimilarityModalComponent,
    SearchResultComponent,
    SearchResultStandaloneContainerComponent,
    SearchFilterDialogComponent,
    SidebarComponent,
    SearchComponent,
    FeedbackComponent,
    RangeBoxComponent,
    FilterBoxItemComponent,
    FilterBoxItemDaterangeComponent,
    FilterBoxItemSwitchComponent,
    FilterBoxItemCheckboxHierarchyComponent,
    FilterBoxComponent,
    FilterPanelComponent,
    FilterBoxItemTaxonomyComponent,
    LinkedResourceDisplayDialogComponent,
    AddFavoriteDialogComponent,
    CreateFavoriteListComponent,
    ResourceHistoricComponent,
    EntityDisplayComponent,
    EntityDisplayItemVersioningComponent,
    EntityDisplayItemTaxonomyComponent,
    EntityDisplayImageComponent,
    EntityDisplayItemComponent,
    EntityDisplayGroupComponent,
    ImageViewerDialogComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    SearchResultStandaloneContainerComponent,
    SearchFilterDialogComponent,
  ],
})
export class SearchModule {}
