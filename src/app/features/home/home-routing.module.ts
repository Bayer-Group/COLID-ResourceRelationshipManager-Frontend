import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GraphContainerComponent } from './graph-container/graph-container.component';
import { HomeComponent } from './home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: 'graph', component: GraphContainerComponent },
      { path: 'graph/:mapId', component: GraphContainerComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}
