import { NgModule } from '@angular/core';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { SharedModule } from '../../shared/shared.module';
import { SidebarModule } from './sidebar/sidebar.module';
import { FootbarModule } from './footbar/footbar.module';
import { GraphComponent } from './graph-container/graph/graph.component';
import { GraphContainerComponent } from './graph-container/graph-container.component';
import { SHARED_VISUALS } from '../../shared/visuals';
import { D3_DIRECTIVES } from '../../core/d3';
import { A11yModule } from '@angular/cdk/a11y';
import { FormsModule } from '@angular/forms';
import { LinkHistoryDialogComponent } from './link-history-dialog/link-history-dialog.component';
import { LinkHistoryComponent } from '../../shared/link-history/link-history.component';

@NgModule({
  declarations: [
    HomeComponent,
    GraphComponent,
    GraphContainerComponent,
    ...SHARED_VISUALS,
    ...D3_DIRECTIVES,
    LinkHistoryDialogComponent,
  ],
  imports: [
    SharedModule,
    HomeRoutingModule,
    SidebarModule,
    FootbarModule,
    A11yModule,
    FormsModule,
    LinkHistoryComponent,
  ],
  bootstrap: [],
})
export class HomeModule {}
