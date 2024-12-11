import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {
  DetailsViewModel,
  SearchResultComponent
} from './search-result.component';
import { Component, Input } from '@angular/core';
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
  MatAccordion
} from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgxsModule } from '@ngxs/store';
import { MatDialogRef } from '@angular/material/dialog';
import { LogService } from 'src/app/shared/services/log.service';
import { IconTypes } from 'src/app/shared/icons/models/icon-types';
import { ColidEntrySubscriptionDto } from 'src/app/shared/models/dto/colid-entry-subscription-dto';
import { DocumentMap } from 'src/app/shared/models/search-result';

describe('SearchResultComponent', () => {
  let component: SearchResultComponent;
  let fixture: ComponentFixture<SearchResultComponent>;

  class MockLogService {}

  class MockMatDialogRef {}

  @Component({
    selector: 'ds-icon',
    template: ''
  })
  class MockColidIconsComponent {
    @Input() icon: string;
    @Input() delay: number;
    @Input() tooltip: string;
    @Input() tooltipDisabled = true;
    @Input() iconType: IconTypes = IconTypes.Default;
  }

  @Component({
    selector: 'app-resource-quality-indicators',
    standalone: true,
    template: ''
  })
  class MockResourceQualityIndicatorsComponent {
    @Input() brokenDistributionEndpoints: string[] | undefined;
    @Input() brokenContacts: string[] | undefined;
    @Input() nextReviewIsDue: boolean | undefined;
  }

  @Component({
    selector: 'app-resource-operations-buttons',
    standalone: true,
    template: ''
  })
  class MockResourceOperationsButtonsComponent {
    @Input() pidUri: string;
    @Input() details: DetailsViewModel[];
    @Input() source: DocumentMap;
    @Input() entryLifeCycleStatus: string;
    @Input() resourceLinkedLifecycleStatus: string | null;
    @Input() colidEntrySubscriptions: ColidEntrySubscriptionDto[];
    @Input() searchText: string;
    @Input() searchTimestamp: string;
    @Input() entityType: string;
    @Input() showFavoritesButton: boolean = false;
    @Input() showSubscribeButton: boolean = false;
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SearchResultComponent, MockColidIconsComponent],
      imports: [
        NoopAnimationsModule,
        NgxsModule.forRoot(),
        MatIcon,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelTitle,
        MatAccordion,
        MatTab,
        MatTabGroup,
        MockResourceQualityIndicatorsComponent,
        MockResourceOperationsButtonsComponent
      ],
      providers: [
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef
        },
        {
          provide: LogService,
          useClass: MockLogService
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show review cycle expired quality indicator', () => {
    const mockDetails: Array<DetailsViewModel> = [
      {
        key: 'https://pid.bayer.com/kos/19050/hasNextReviewDueDate',
        value: ['3000-01-01T01:01:01Z'] // If this test is red... you are still using this software in the year 3000?!
      } as DetailsViewModel
    ];

    component.details = mockDetails;

    component['setReviewDateQualityIndicators']();

    expect(component.nextReviewIsDue).toBeFalse();
  });

  it('should show review cycle valid quality indicator', () => {
    const mockDetails: Array<DetailsViewModel> = [
      {
        key: 'https://pid.bayer.com/kos/19050/hasNextReviewDueDate',
        value: ['2000-01-01T01:01:01Z'] // If this test is red, time travel has been invented - welcome to the past!
      } as DetailsViewModel
    ];

    component.details = mockDetails;

    component['setReviewDateQualityIndicators']();

    expect(component.nextReviewIsDue).toBeTrue();
  });

  it('should show broken contacts quality indicators', () => {
    const expectedBrokenContacts = ['Mock person 1', 'Mock person 2'];

    const mockDetails: Array<DetailsViewModel> = [
      {
        key: 'https://pid.bayer.com/kos/19050/hasBrokenDataSteward',
        value: ['Mock person 1', 'Mock person 2']
      } as DetailsViewModel
    ];

    component.details = mockDetails;

    component['setBrokenContactsAndEndpointsQualityIndicators']();

    expect(component.brokenContacts).toEqual(expectedBrokenContacts);
  });

  it('should show broken distribution endpoints quality indicators', () => {
    const expectedBrokenEndpoints = [
      'Mock broken endpoint 1',
      'Mock broken endpoint 2'
    ];

    const mockDetails: Array<DetailsViewModel> = [
      {
        key: 'https://pid.bayer.com/kos/19050/distribution',
        value: [
          {
            'https://pid.bayer.com/kos/19050/hasNetworkedResourceLabel': {
              outbound: [
                {
                  value: 'Mock broken endpoint 1',
                  uri: null,
                  edge: null
                }
              ],
              inbound: []
            },
            'https://pid.bayer.com/kos/19050/hasEndpointURLStatus': {
              outbound: [
                {
                  value: 'Broken',
                  uri: null,
                  edge: null
                }
              ],
              inbound: []
            }
          },
          {
            'https://pid.bayer.com/kos/19050/hasNetworkedResourceLabel': {
              outbound: [
                {
                  value: 'Mock broken endpoint 2',
                  uri: null,
                  edge: null
                }
              ],
              inbound: []
            },
            'https://pid.bayer.com/kos/19050/hasEndpointURLStatus': {
              outbound: [
                {
                  value: 'Broken',
                  uri: null,
                  edge: null
                }
              ],
              inbound: []
            }
          }
        ]
      } as DetailsViewModel
    ];

    component.details = mockDetails;

    component['setBrokenContactsAndEndpointsQualityIndicators']();

    expect(component.brokenDistributionEndpoints).toEqual(
      expectedBrokenEndpoints
    );
  });

  it('should show broken contacts quality indicators for distribution links', () => {
    const expectedBrokenContacts = ['Mock person 1', 'Mock person 2'];

    const mockDetails: Array<DetailsViewModel> = [
      {
        key: 'https://pid.bayer.com/kos/19050/distribution',
        value: [
          {
            'https://pid.bayer.com/kos/19050/hasBrokenEndpointContact': {
              outbound: [
                {
                  value: 'Mock person 1',
                  uri: null,
                  edge: null
                }
              ],
              inbound: []
            }
          },
          {
            'https://pid.bayer.com/kos/19050/hasBrokenEndpointContact': {
              outbound: [
                {
                  value: 'Mock person 2',
                  uri: null,
                  edge: null
                }
              ],
              inbound: []
            }
          }
        ]
      } as DetailsViewModel
    ];

    component.details = mockDetails;

    component['setBrokenContactsAndEndpointsQualityIndicators']();

    expect(component.brokenContacts).toEqual(expectedBrokenContacts);
  });
});
