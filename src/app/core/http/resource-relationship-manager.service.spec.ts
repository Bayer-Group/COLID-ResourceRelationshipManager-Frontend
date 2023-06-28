import { TestBed } from '@angular/core/testing';

import { ResourceRelationshipManagerService } from './resource-relationship-manager.service';

describe('ResourceRelationshipManagerService', () => {
  let service: ResourceRelationshipManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResourceRelationshipManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
