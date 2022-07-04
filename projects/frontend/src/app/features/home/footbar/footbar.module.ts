import { NgModule } from '@angular/core';
import { FootbarComponent } from './footbar.component';
import { UndoComponent } from './undo/undo.component';
import { TreedeepComponent } from './treedeep/treedeep.component';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  declarations: [UndoComponent, TreedeepComponent, FootbarComponent],
  imports: [SharedModule],
  exports: [FootbarComponent]
})
export class FootbarModule {}
