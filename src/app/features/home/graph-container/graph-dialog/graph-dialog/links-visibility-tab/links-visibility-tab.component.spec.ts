import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinksVisibilityTabComponent } from './links-visibility-tab.component';
import { LinkDto } from 'src/app/shared/models/link-dto';
import { AgGridAngular } from '@ag-grid-community/angular';
import { GridApi, IRowNode } from '@ag-grid-community/core';
import { IconCellRendererParams } from 'src/app/shared/ag-grid/icon-cell-renderer/icon-cell-renderer.component';

describe('LinksVisibilityTabComponent', () => {
  let component: LinksVisibilityTabComponent;
  let fixture: ComponentFixture<LinksVisibilityTabComponent>;

  const mockLinks: Array<LinkDto> = [
    {
      targetType: 'Type1',
      linkType: { key: 'linkTypeKey', value: 'LinkType1' },
      targetName: 'Target1',
      isRendered: false
    } as LinkDto,
    {
      targetType: 'Type2',
      linkType: { key: 'linkTypeKey', value: 'LinkType2' },
      targetName: 'Target2',
      isRendered: true
    } as LinkDto
  ];

  const mockRows = [
    {
      selected: false,
      targetType: 'Type1',
      linkType: 'LinkType1',
      targetName: 'Target1',
      originalLink: mockLinks[0]
    },
    {
      selected: true,
      targetType: 'Type2',
      linkType: 'LinkType2',
      targetName: 'Target2',
      originalLink: mockLinks[1]
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinksVisibilityTabComponent, AgGridAngular]
    }).compileComponents();

    fixture = TestBed.createComponent(LinksVisibilityTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate table rows from incoming links', () => {
    component.ngOnChanges({
      links: {
        currentValue: mockLinks,
        previousValue: [],
        firstChange: true,
        isFirstChange: () => true
      }
    });

    expect(component.rowData).toEqual(mockRows);
    expect(component.filteredRowsCount).toBe(2);
  });

  it('should emit selected links', () => {
    component.gridApi = {
      getSelectedRows(): Array<any> {
        return [mockRows[0]];
      },
      forEachNodeAfterFilter(
        // Reason: necessary to mock the method
        // eslint-disable-next-line
        callback: (rowNode: any, index: number) => void
      ): void {}
    } as GridApi;

    spyOn(component.selectedLinks, 'emit');

    component.ngOnChanges({
      links: {
        currentValue: mockLinks,
        previousValue: [],
        firstChange: true,
        isFirstChange: () => true
      }
    });

    component.onSelectionChanged();

    expect(component.selectedLinks.emit).toHaveBeenCalledWith([mockLinks[0]]);
  });

  it('should count filtered rows', () => {
    component.gridApi = {
      forEachNodeAfterFilter(callback: (rowNode: any, index: number) => void) {
        callback({}, 0);
        callback({}, 1);
      }
    } as GridApi;

    component.onFilterChanged();

    expect(component.filteredRowsCount).toBe(2);
  });

  it('should create icon cell renderer parameters and text value for VERSION LINK', () => {
    const mockLink: LinkDto = {
      isVersionLink: true
    } as LinkDto;

    const expectedLinkIconParams = {
      fontIcon: 'link',
      tooltipText: 'Version link'
    } as IconCellRendererParams;

    const expectedTextValue = 'Version link';

    const iconParams = component['getLinkTypeIconParams'](mockLink);
    const textValue = component['getLinkTypeTextValue'](mockLink);

    expect(iconParams).toEqual(expectedLinkIconParams);
    expect(textValue).toEqual(expectedTextValue);
  });

  it('should create icon cell renderer parameters and text value for OUTBOUND LINK', () => {
    const mockLink: LinkDto = {
      isVersionLink: false,
      outbound: true
    } as LinkDto;

    const expectedLinkIconParams = {
      svgIcon: 'assets/outgoing.svg',
      tooltipText: 'Outbound link'
    } as IconCellRendererParams;

    const expectedTextValue = 'Outbound link';

    const iconParams = component['getLinkTypeIconParams'](mockLink);
    const textValue = component['getLinkTypeTextValue'](mockLink);

    expect(iconParams).toEqual(expectedLinkIconParams);
    expect(textValue).toEqual(expectedTextValue);
  });

  it('should create icon cell renderer parameters and text value for INBOUND LINK', () => {
    const mockLink: LinkDto = {
      isVersionLink: false,
      outbound: false
    } as LinkDto;

    const expectedLinkIconParams = {
      svgIcon: 'assets/incoming.svg',
      tooltipText: 'Inbound link'
    } as IconCellRendererParams;

    const expectedTextValue = 'Inbound link';

    const iconParams = component['getLinkTypeIconParams'](mockLink);
    const textValue = component['getLinkTypeTextValue'](mockLink);

    expect(iconParams).toEqual(expectedLinkIconParams);
    expect(textValue).toEqual(expectedTextValue);
  });

  it('should create icon cell renderer parameters and text value for RESOURCE TARGET TYPE', () => {
    const mockLink: LinkDto = {
      targetType: 'Type1'
    } as LinkDto;

    const expectedIconParams = {
      s3Icon: 'Type1'
    } as IconCellRendererParams;

    const expectedTextValue = 'Type1';

    const iconParams = component['getTargetTypeIconParams'](mockLink);
    const textValue = component['getTargetTypeTextValue'](mockLink);

    expect(iconParams).toEqual(expectedIconParams);
    expect(textValue).toEqual(expectedTextValue);
  });

  it('should pre-select rendered links', () => {
    const mockNodes: Array<IRowNode> = [
      {
        data: mockRows[0]
      } as IRowNode,
      {
        data: mockRows[1]
      } as IRowNode
    ];

    const expectedObject = {
      nodes: [mockNodes[1]],
      newValue: true
    };

    component.gridApi = {
      forEachNode(callback: (rowNode: any, index: number) => void): void {
        callback(mockNodes[0], 0);
        callback(mockNodes[1], 1);
      },
      // Reason: necessary to mock the method
      // eslint-disable-next-line
      setNodesSelected(obj: any): void {}
    } as GridApi;

    const spy = spyOn(component.gridApi, 'setNodesSelected').and.stub();

    component.onFirstDataRendered();

    expect(spy).toHaveBeenCalledWith(expectedObject);
  });
});
