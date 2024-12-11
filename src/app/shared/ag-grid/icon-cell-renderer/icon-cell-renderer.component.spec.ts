import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  IconCellRendererComponent,
  IconCellRendererParams
} from './icon-cell-renderer.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

describe('IconCellRendererComponent', () => {
  let component: IconCellRendererComponent;
  let fixture: ComponentFixture<IconCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        IconCellRendererComponent,
        CommonModule,
        MatIconModule,
        MatTooltipModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IconCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should refresh', () => {
    expect(component.refresh()).toBeTrue();
  });

  it('should throw an error if both fontIcon and svgIcon are empty', () => {
    expect(() => {
      component.agInit({} as any);
    }).toThrowError(
      'IconCellRenderer: no icon values are provided, set exactly one value of "fontIcon", "svgIcon" OR "s3Icon".'
    );
  });

  it('should throw an error if more than one icon value is provided', () => {
    const errorText =
      'IconCellRenderer: more than one icon value provided, set exactly one value of "fontIcon", "svgIcon" OR "s3Icon"';

    expect(() => {
      component.agInit({
        fontIcon: 'mockIcon',
        svgIcon: 'mockSvgIcon'
      } as IconCellRendererParams);
    }).toThrowError(errorText);

    expect(() => {
      component.agInit({
        svgIcon: 'mockSvgIcon',
        s3Icon: 'mockS3Icon'
      } as IconCellRendererParams);
    }).toThrowError(errorText);

    expect(() => {
      component.agInit({
        fontIcon: 'mockIcon',
        s3Icon: 'mockS3Icon'
      } as IconCellRendererParams);
    }).toThrowError(errorText);

    expect(() => {
      component.agInit({
        fontIcon: 'mockIcon',
        svgIcon: 'mockSvgIcon',
        s3Icon: 'mockS3Icon'
      } as IconCellRendererParams);
    }).toThrowError(errorText);
  });

  it('should extract parameters for MatIcon', () => {
    component.agInit({
      fontIcon: 'mockIcon',
      tooltipText: 'mockTooltipText'
    } as IconCellRendererParams);

    expect(component.fontIcon).toBe('mockIcon');
    expect(component.svgIcon).toBeUndefined();
    expect(component.s3Icon).toBeUndefined();
    expect(component.tooltipText).toBe('mockTooltipText');
  });

  it('should extract parameters for SVG icon', () => {
    component.agInit({
      svgIcon: 'mockSvg',
      tooltipText: 'mockTooltipText'
    } as IconCellRendererParams);

    expect(component.fontIcon).toBeUndefined();
    expect(component.svgIcon).toBe('mockSvg');
    expect(component.s3Icon).toBeUndefined();
    expect(component.tooltipText).toBe('mockTooltipText');
  });

  it('should extract parameters for S3 icon', () => {
    component.agInit({
      s3Icon: 'mockS3',
      tooltipText: 'mockTooltipText'
    } as IconCellRendererParams);

    expect(component.fontIcon).toBeUndefined();
    expect(component.svgIcon).toBeUndefined();
    expect(component.s3Icon).toBe('mockS3');
    expect(component.tooltipText).toBe('mockTooltipText');
  });
});
