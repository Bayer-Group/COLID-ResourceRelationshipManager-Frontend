import { TestBed } from '@angular/core/testing';

import { NgxsModule } from '@ngxs/store';
import { D3Service } from './d3.service';

describe('D3Service', () => {
  let service: D3Service;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot()],
      providers: [D3Service]
    });

    service = TestBed.inject(D3Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
