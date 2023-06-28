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
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MsalRedirectComponent } from './modules/authentication/services/msal.redirect.component';
import {
  BrowserCacheLocation,
  InteractionType,
  LogLevel,
  PublicClientApplication,
} from '@azure/msal-browser';
import { MsalModule } from '@azure/msal-angular';
import {
  isIE,
  loggerCallback,
} from './modules/authentication/azure-authentication.module';
import { ColidMatSnackBarComponent } from './shared/colid-mat-snack-bar/colid-mat-snack-bar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { SidebarState } from './state/sidebar.state';
import { SearchState } from './state/search.state';
import { ImageViewerDialogComponent } from './shared/image-viewer-dialog/image-viewer-dialog.component';
import { CommonModule, DatePipe } from '@angular/common';
import { LogPublishersService } from './shared/services/log-publishers.service';
import { LoggedInComponent } from './shared/components/logged-in/logged-in.component';
import { LoginInProgressComponent } from './shared/components/login-in-progress/login-in-progress.component';
import { UnauthorizedComponent } from './shared/components/unauthorized/unauthorized.component';
import { LoadingIndicatorPipe } from './loadingIndicator.pipe';
import { FilterState } from './state/filter.state';
import { MatIconModule } from '@angular/material/icon';
import { GraphDialogComponent } from './features/home/graph-container/graph-dialog/graph-dialog/graph-dialog.component';
import { LinkIconPipe } from './shared/pipes/link-icon.pipe';
import { ColidIconsModule } from './shared/icons/colid-icons.module';
import { CookieModule } from 'ngx-cookie';
import { MapDataState } from './state/map-data.state';
import { GraphDataState } from './state/graph-data.state';
import { GraphLinkingDataState } from './state/graph-linking.state';
import { GraphVisualisationState } from './state/graph-visualisation.state';
import { SavingTriggerState } from './state/saving-trigger.state';
import { UserInfoState } from './state/user-info.state';
import { LinkHistoryComponent } from './shared/link-history/link-history.component';
import { SharedModule } from './shared/shared.module';
import { DisplayLinksComponent } from './features/home/graph-container/graph-dialog/display-links/display-links.component';
import { FavoritesState } from './state/favorites.state';
import { TaxonomyState } from './state/taxonomy.state';

const states = [
  MetadataState,
  SidebarState,
  SearchState,
  FilterState,
  MapDataState,
  GraphDataState,
  GraphLinkingDataState,
  GraphVisualisationState,
  SavingTriggerState,
  UserInfoState,
  FavoritesState,
  TaxonomyState,
];
const protectedResourceMap = new Map(
  Object.entries(environment.adalConfig.protectedResourceMap)
);
@NgModule({
  declarations: [
    AppComponent,
    ConfirmationDialogComponent,
    ColidMatSnackBarComponent,
    ImageViewerDialogComponent,
    LoggedInComponent,
    LoginInProgressComponent,
    UnauthorizedComponent,
    LoadingIndicatorPipe,
    GraphDialogComponent,
    LinkIconPipe,
    DisplayLinksComponent,
  ],
  imports: [
    MatIconModule,
    ReactiveFormsModule,
    MsalModule.forRoot(
      new PublicClientApplication({
        //MSAL Config
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
            piiLoggingEnabled: false,
          },
        },
      }),
      {
        //MSAL GUard Config
        interactionType: InteractionType.Redirect,
        authRequest: {
          scopes: ['user.read', 'openid', 'profile', 'email'],
        },
        loginFailedRoute: '/login-failed',
      },
      {
        interactionType: InteractionType.Redirect,
        protectedResourceMap,
      }
    ),
    CommonModule,
    AppRoutingModule,
    FormsModule,
    FormsModule,
    CoreModule,
    MatIconModule,
    HttpClientModule,
    ClipboardModule,
    AuthenticationModule.forRoot(),
    BrowserSupportModule,
    InfiniteScrollModule,
    BrowserAnimationsModule,
    NgxsModule.forRoot(states),
    SharedModule,
    ScrollingModule,
    ColidIconsModule,
    CookieModule.withOptions(),
    LinkHistoryComponent,
  ],
  providers: [
    LogPublishersService,
    D3Service,
    ResourceRelationshipManagerService,
    DatePipe,
  ],
  bootstrap: [AppComponent, MsalRedirectComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
