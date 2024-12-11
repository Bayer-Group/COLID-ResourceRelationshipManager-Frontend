import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistributionEndpointComponent } from './distribution-endpoint.component';
import { LogService } from 'src/app/shared/services/log.service';
import { NgxsModule } from '@ngxs/store';
import { Component, Input } from '@angular/core';
import { IconTypes } from 'src/app/shared/icons/models/icon-types';
import { MatIconModule } from '@angular/material/icon';

describe('DistributionEndpointComponent', () => {
  let component: DistributionEndpointComponent;
  let fixture: ComponentFixture<DistributionEndpointComponent>;

  class MockLogService {
    info() {}
  }

  @Component({
    selector: 'ds-icon',
    template: ''
  })
  class MockColidIconsComponent {
    @Input() icon: string = '';
    @Input() delay: number = 0;
    @Input() tooltip: string = '';
    @Input() tooltipDisabled: boolean = true;
    @Input() iconType: IconTypes = IconTypes.Default;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DistributionEndpointComponent, MockColidIconsComponent],
      imports: [NgxsModule.forRoot(), MatIconModule],
      providers: [
        {
          provide: LogService,
          useClass: MockLogService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DistributionEndpointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // TODO: need to provide the correct values for the inputs
  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
