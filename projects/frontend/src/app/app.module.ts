import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { StoreModule } from '@ngrx/store';
import { graphVisualisationReducer } from './state/graph-visualisation/graph-visualisation.reducer';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { D3Service, D3_DIRECTIVES } from './core/d3';
import { graphDataReducer } from './state/graph-data/graph-data.reducer';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxsModule } from '@ngxs/store';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MetadataState } from './state/metadata.state';
import { ResourceRelationshipManagerService } from './core/http/resource-relationship-manager.service';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { BrowserSupportModule } from './modules/browser-support/browser-support.module';
import { graphLinkingReducer } from './state/graph-linking/graph-linking.reducer';
import { mapDataReducer } from './state/map-data/map-data.reducer';
import { EffectsModule } from '@ngrx/effects';
import { MapEffects } from './state/map-data/map-data.effects';
import { savingTriggerReducer } from './state/saving-trigger/saving-trigger.reducer';
import { ConfirmationDialogComponent } from './shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MsalRedirectComponent } from './modules/authentication/services/msal.redirect.component';
import { BrowserCacheLocation, InteractionType, LogLevel, PublicClientApplication } from '@azure/msal-browser';
import { MsalBroadcastService, MsalGuard, MsalModule, MsalService } from '@azure/msal-angular';
import { isIE, loggerCallback } from './modules/authentication/azure-authentication.module';


const states = [
  MetadataState
];
const protectedResourceMap = new Map(Object.entries(environment.adalConfig.protectedResourceMap));
@NgModule({
  declarations: [AppComponent, ConfirmationDialogComponent],
  imports: [
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
    AppRoutingModule,
    CoreModule,
    MatDialogModule,
    HttpClientModule,
    AuthenticationModule.forRoot(),
    BrowserSupportModule,
    InfiniteScrollModule,
    StoreModule.forRoot({
      graphVisualisation: graphVisualisationReducer,
      graphData: graphDataReducer,
      graphLinking: graphLinkingReducer,
      mapData: mapDataReducer,
      savingTrigger: savingTriggerReducer
    }),
    EffectsModule.forRoot([MapEffects]),
    EffectsModule.forFeature([MapEffects]),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production
    }),
    BrowserAnimationsModule,
    NgxsModule.forRoot(states),
    MatButtonModule,
    MatSnackBarModule,
    ScrollingModule
  ],
  providers: [
    D3Service,
    ResourceRelationshipManagerService
  ],
  bootstrap: [AppComponent, MsalRedirectComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
