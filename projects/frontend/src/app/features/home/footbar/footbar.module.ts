import { NgModule } from '@angular/core';
import { FootbarComponent } from './footbar.component';
import { UndoComponent } from './undo/undo.component';
import { TreedeepComponent } from './treedeep/treedeep.component';
import { SharedModule } from '../../../shared/shared.module';
import { UserGuidanceComponent } from './user-guidance/user-guidance.component';

@NgModule({
  declarations: [UndoComponent, TreedeepComponent, UserGuidanceComponent, FootbarComponent],
  imports: [SharedModule],
  exports: [FootbarComponent]
})
export class FootbarModule {}
