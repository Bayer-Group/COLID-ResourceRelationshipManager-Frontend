import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PidWithCopyButtonCellRendererComponent } from './pid-with-copy-button-cell-renderer.component';

describe('PidWithCopyButtonCellRendererComponent', () => {
  let component: PidWithCopyButtonCellRendererComponent;
  let fixture: ComponentFixture<PidWithCopyButtonCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PidWithCopyButtonCellRendererComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PidWithCopyButtonCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render PID and copy button if value is not provided');
});
