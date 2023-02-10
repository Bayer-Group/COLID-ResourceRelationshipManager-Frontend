import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar.component';
import { LineageComponent } from './lineage/lineage.component';
import { DetailsComponent } from './details/details.component';
import { SchemaComponent } from './schema/schema.component';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  declarations: [
    LineageComponent,
    DetailsComponent,
    SchemaComponent,
    SidebarComponent,
  ],
  imports: [CommonModule, SharedModule],
  exports: [SidebarComponent],
})
export class SidebarModule {}
