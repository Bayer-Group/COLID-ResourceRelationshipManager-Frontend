import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphContainerComponent } from './graph-container.component';
import { NgxsModule } from '@ngxs/store';
import { ResourceRelationshipManagerService } from 'src/app/shared/services/resource-relationship-manager.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatLineModule } from '@angular/material/core';

describe('GraphContainerComponent', () => {
  let component: GraphContainerComponent;
  let fixture: ComponentFixture<GraphContainerComponent>;

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: () => 'mockValue'
      }
    },
    queryParams: of({ key: 'value' })
  };

  class MockResourceRelationshipManagerService {}

  @Component({
    selector: 'graph',
    template: ''
  })
  class MockGraphComponent {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GraphContainerComponent, MockGraphComponent],
      imports: [
        NgxsModule.forRoot(),
        RouterModule,
        MatButtonModule,
        MatAccordion,
        MatExpansionModule,
        MatListModule,
        MatLineModule
      ],
      providers: [
        {
          provide: ResourceRelationshipManagerService,
          useClass: MockResourceRelationshipManagerService
        },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GraphContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // TODO: needs proper data mocking
  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
