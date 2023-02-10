import { Component } from '@angular/core';

@Component({
  selector: 'colid-undo',
  templateUrl: './undo.component.html',
  styleUrls: ['./undo.component.scss'],
})
export class UndoComponent {
  SelectedStep: string | undefined;

  selectStep = (step: string): void => {
    this.SelectedStep = step;
    return undefined;
  };
}
