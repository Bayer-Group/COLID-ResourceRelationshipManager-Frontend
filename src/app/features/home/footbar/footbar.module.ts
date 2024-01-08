import { NgModule } from '@angular/core';
import { FootbarComponent } from './footbar.component';
import { UndoComponent } from './undo/undo.component';
import { TreedeepComponent } from './treedeep/treedeep.component';
import { SharedModule } from '../../../shared/shared.module';
import { UserGuidanceComponent } from './user-guidance/user-guidance.component';
import { MapDetailsDialogComponent } from './user-guidance/map-details-dialog/map-details-dialog.component';

@NgModule({
  declarations: [
    UndoComponent,
    TreedeepComponent,
    UserGuidanceComponent,
    FootbarComponent,
    MapDetailsDialogComponent,
  ],
  imports: [SharedModule],
  exports: [FootbarComponent],
})
export class FootbarModule {}
