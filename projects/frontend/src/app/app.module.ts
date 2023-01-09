import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { environment } from '../environments/environment';
import { D3Service } from './core/d3';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxsModule } from '@ngxs/store';
import { HttpClientModule } from '@angular/common/http';
import { MetadataState } from './state/metadata.state';
import { ResourceRelationshipManagerService } from './core/http/resource-relationship-manager.service';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { BrowserSupportModule } from './modules/browser-support/browser-support.module';
import { ConfirmationDialogComponent } from './shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MsalRedirectComponent } from './modules/authentication/services/msal.redirect.component';
import { BrowserCacheLocation, InteractionType, LogLevel, PublicClientApplication } from '@azure/msal-browser';
import { MsalModule } from '@azure/msal-angular';
import { isIE, loggerCallback } from './modules/authentication/azure-authentication.module';
import { SearchComponent } from './core/search/search.component';
import { ColidMatSnackBarComponent } from './shared/colid-mat-snack-bar/colid-mat-snack-bar.component';
import { SearchFilterDialogComponent } from './shared/search-filter-dialog/search-filter-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { SearchResultStandaloneContainerComponent } from './shared/search-result-standalone-container/search-result-standalone-container.component';
import { SearchResultsComponent } from './shared/search-results/search-results.component';
import { SearchBarAutocompleteComponent } from './shared/search-bar-autocomplete/search-bar-autocomplete.component';
import { SearchBarComponent } from './shared/search-bar/search-bar.component';
import { SearchResultAttachmentComponent } from './shared/search-result/search-result-attachment/search-result-attachment.component';
import { AppMaterialModule } from './modules/app-material.module';
import { FeedbackComponent } from './shared/image-viewer-dialog/feedback/feedback.component';
import { DistributionEndpointComponent } from './shared/search-result/distribution-endpoint/distribution-endpoint.component';
import { SidebarState } from './state/sidebar.state';
import { SearchState } from './state/search.state';
import { RRMState } from './state/rrm.state';
import { SearchResultComponent } from './shared/search-result/search-result.component';
import { SimilarityModalComponent } from './shared/search-result/similarity-modal/similarity-modal.component';
import { ResourcePoliciesComponent } from './shared/search-result/resource-policies/resource-policies.component';
import { LinkedResourceDisplayDialog } from './shared/linked-resource-dialog/linked-resource-display-dialog.component';
import { ImageViewerDialogComponent } from './shared/image-viewer-dialog/image-viewer-dialog.component';
import { SearchResultLinkTypeComponent } from './shared/search-result/search-result-link-type/search-result-link-type.component';
import { CommonModule, DatePipe, } from '@angular/common';
import { LogPublishersService } from './shared/log-publishers.service';
import { FilterPanelComponent } from './shared/filter-panel/filter-panel.component';
import { FilterBoxComponent } from './shared/filter-panel/filter-box/filter-box.component';
import { FilterBoxItemCheckboxHierarchyComponent } from './shared/filter-panel/filter-box/filter-box-checkboxHierarchy/filter-box-item-checkboxHierarchy.component';
import { LoggedInComponent } from './shared/components/logged-in/logged-in.component';
import { LoginInProgressComponent } from './shared/components/login-in-progress/login-in-progress.component';
import { FilterBoxItemSwitchComponent } from './shared/filter-panel/filter-box/filter-box-item-switch/filter-box-item-switch.component';
import { FilterBoxItemDaterangeComponent } from './shared/filter-panel/filter-box/filter-box-item-daterange/filter-box-item-daterange.component';
import { RangeBoxComponent } from './shared/filter-panel/range-box/range-box.component';
import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';
import { HighlightPipe } from './highlight.pipe';
import { JoinPipe } from './join.pipe';
import { ColumnsNamePipe } from './columnsName.pipe';
import { LoadingIndicatorPipe } from './loadingIndicator.pipe';
import { SchemeUIComponent } from './shared/search-result/scheme-ui/scheme-ui.component';
import { FilterBoxItemComponent } from './shared/filter-panel/filter-box/filter-box-item/filter-box-item.component';
import { SidebarComponent } from './features/home/sidebar/sidebar.component/sidebar.component';
import { FilterBoxItemTaxonomyComponent } from './../app/shared/filter-box-item-taxonomy/filter-box-item-taxonomy.component';
import { DebounceDirective } from './core/search/debounce.directive';
import { FilterState } from './shared/filter.state';
import { UserInfoState } from './state/user-info.state';
import { NgSelectModule } from '@ng-select/ng-select';
import { ColidSpinnerComponent } from './shared/colid-spinner/colid-spinner.component';
import { MatIconModule } from '@angular/material/icon';
import { GraphDialogComponent } from './features/home/graph-container/graph-dialog/graph-dialog/graph-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { LinkIconPipe } from './shared/pipes/link-icon.pipe';
import { ColidIconsModule } from './shared/icons/colid-icons.module';
import { CookieModule } from 'ngx-cookie';
import { A11yModule } from '@angular/cdk/a11y';
import { MapDataState } from './state/map-data.state';
import { GraphDataState } from './state/graph-data.state';
import { GraphLinkingDataState } from './state/graph-linking.state';
import { GraphVisualisationState } from './state/graph-visualisation.state';
import { SavingTriggerState } from './state/saving-trigger.state';


const states = [
  MetadataState,
  SidebarState,
  SearchState,
  RRMState,
  FilterState,
  UserInfoState,
  MapDataState,
  GraphDataState,
  GraphLinkingDataState,
  GraphVisualisationState,
  SavingTriggerState
];
const protectedResourceMap = new Map(Object.entries(environment.adalConfig.protectedResourceMap));
@NgModule({
  declarations: [AppComponent,
    ConfirmationDialogComponent,
    SearchComponent,
    ColidMatSnackBarComponent,
    ColidSpinnerComponent,
    SearchFilterDialogComponent,
    SearchResultAttachmentComponent,
    SearchResultStandaloneContainerComponent,
    SearchResultsComponent,
    SearchBarAutocompleteComponent,
    SearchBarComponent,
    FeedbackComponent,
    DistributionEndpointComponent,
    SearchResultComponent,
    SimilarityModalComponent,
    ResourcePoliciesComponent,
    LinkedResourceDisplayDialog,
    ImageViewerDialogComponent,
    SearchResultLinkTypeComponent,
    FilterPanelComponent,
    FilterBoxComponent,
    FilterBoxItemCheckboxHierarchyComponent,
    SidebarComponent,
    LoggedInComponent,
    LoginInProgressComponent,
    FilterBoxItemSwitchComponent,
    FilterBoxItemDaterangeComponent,
    RangeBoxComponent,
    UnauthorizedComponent,
    HighlightPipe,
    JoinPipe,
    ColumnsNamePipe,
    LoadingIndicatorPipe,
    SchemeUIComponent,
    FilterBoxItemComponent,
    FilterBoxItemTaxonomyComponent,
    DebounceDirective,
    GraphDialogComponent,
    LinkIconPipe
  ],
  imports: [
    NgSelectModule,
    MatIconModule,
    ReactiveFormsModule,
    A11yModule,
    MsalModule.forRoot(new PublicClientApplication({//MSAL Config
      auth: {
        clientId: environment.adalConfig.clientId,
        authority: environment.adalConfig.authority,
        redirectUri: environment.adalConfig.redirectUri,
        postLogoutRedirectUri: environment.adalConfig.postLogoutRedirectUri,
        navigateToLoginRequestUrl: false,
      },
      cache: {
        cacheLocation: BrowserCacheLocation.LocalStorage,
        storeAuthStateInCookie: isIE, // set to true for IE 11
      },
      system: {
        loggerOptions: {
          loggerCallback,
          logLevel: LogLevel.Info,
          piiLoggingEnabled: false
        }
      }
    }), {//MSAL GUard Config
      interactionType: InteractionType.Redirect,
      authRequest: {
        scopes: ["user.read", "openid", "profile", "email"]
      },
      loginFailedRoute: "/login-failed"
    }, {

      interactionType: InteractionType.Redirect,
      protectedResourceMap
    }),
    CommonModule,
    AppRoutingModule,
    FormsModule,
    FormsModule,
    CoreModule,
    MatIconModule,
    MatTooltipModule,
    MatTableModule,
    MatDialogModule,
    AppMaterialModule,
    MatCheckboxModule,
    HttpClientModule,
    ClipboardModule,
    AuthenticationModule.forRoot(),
    BrowserSupportModule,
    InfiniteScrollModule,
    BrowserAnimationsModule,
    NgxsModule.forRoot(states),
    MatButtonModule,
    MatSnackBarModule,
    ScrollingModule,
    ColidIconsModule,
    CookieModule.withOptions()
  ],
  providers: [
    LogPublishersService,
    D3Service,
    ResourceRelationshipManagerService,
    DatePipe
  ],
  bootstrap: [AppComponent, MsalRedirectComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
