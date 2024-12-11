import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  IconButtonsCellRendererComponent,
  IconButtonsCellRendererParams
} from './icon-buttons-cell-renderer.component';
import { GraphMapInfo } from '../../models/graph-map-info';

describe('IconButtonsCellRendererComponent', () => {
  let component: IconButtonsCellRendererComponent;
  let fixture: ComponentFixture<IconButtonsCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconButtonsCellRendererComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(IconButtonsCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should refresh', () => {
    expect(component.refresh()).toBeTrue();
  });

  it('should call passed function on button click', () => {
    var mockFunctionCalledWith: GraphMapInfo;

    const mockParams = {
      data: {
        originalMap: { name: 'test' }
      },
      actions: [
        {
          actionFunction: (params) => {
            mockFunctionCalledWith = params.data.originalMap;
          }
        }
      ]
    } as unknown as IconButtonsCellRendererParams;

    component.agInit(mockParams);
    component.onButtonClick(mockParams.actions[0]);

    expect(mockFunctionCalledWith).toEqual(mockParams.data.originalMap);
  });
});
