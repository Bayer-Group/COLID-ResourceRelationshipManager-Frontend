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
import { SearchComponent } from '../../core/search/search.component';
import { A11yModule } from '@angular/cdk/a11y';

@NgModule({
  declarations: [
    HomeComponent,
    GraphComponent,
    GraphContainerComponent, ...SHARED_VISUALS, ...D3_DIRECTIVES
  ],
  imports: [SharedModule, HomeRoutingModule, SidebarModule, FootbarModule, A11yModule],
  bootstrap: []
})
export class HomeModule { }
