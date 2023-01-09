import { A11yModule } from '@angular/cdk/a11y';
import { NgModule } from '@angular/core';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { UrlSafePipe } from '../../../shared/pipes/urlsafe.pipe';
import { SharedModule } from '../../../shared/shared.module';
import { SearchComponent } from '../../search/search.component';
import { AddLinkDialogComponent } from './add-link-dialog/add-link-dialog.component';
import { AddResourceDialogComponent } from './add-resource-dialog/add-resource-dialog.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { LinkingComponent } from './linking/linking.component';
import { MapComponent } from './map/map.component';
import { MapsBrowserComponent } from './maps-browser/maps-browser.component';
import { NavbarComponent } from './navbar.component';
import { ResourceComponent } from './resource/resource.component';
import { SaveConfirmationDialogComponent } from './save-confirmation-dialog/save-confirmation-dialog.component';
import { SaveMapDialogComponent } from './save-map-dialog/save-map-dialog.component';
import { ViewComponent } from './view/view.component';
@NgModule({
  declarations: [

    AuthenticationComponent,
    MapComponent,
    ResourceComponent,
    ViewComponent,
    NavbarComponent,
    AddResourceDialogComponent,
    UrlSafePipe,
    LinkingComponent,
    AddLinkDialogComponent,
    SaveMapDialogComponent,
    SaveConfirmationDialogComponent,
    MapsBrowserComponent
  ],
  imports: [SharedModule, InfiniteScrollModule, A11yModule],
  exports: [NavbarComponent, UrlSafePipe]
})
export class NavbarModule { }
