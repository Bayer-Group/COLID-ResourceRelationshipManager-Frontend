import { Directive, Input, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { Select } from '@ngxs/store';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../../modules/authentication/services/auth.service';
import { DetailsViewModel } from '../../search/search-result/search-result.component';
import { UserInfoState } from '../../state/user-info.state';
import { Constants } from '../constants';
import { ConsumerGroupResultDto } from '../models/dto/consumer-group-result-dto';

@Directive({
  selector: '[editorAccessControl]',
  standalone: true
})
export class EditorAccessControlDirective implements OnInit, OnDestroy {
  @Input() resourceDetails: DetailsViewModel[];

  @Select(UserInfoState.getConsumerGroups) userConsumerGroups$: Observable<
    ConsumerGroupResultDto[]
  >;
  sub: Subscription;

  constructor(
    private elementRef: ElementRef,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.elementRef.nativeElement.style.display = 'none';
    this.sub = this.checkAccess.subscribe();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  get checkAccess() {
    return combineLatest([
      this.authService.hasAdminPrivilege$,
      this.userConsumerGroups$
    ]).pipe(
      tap(([hasAdminPrivilege, userConsumerGroups]) => {
        let authorized = hasAdminPrivilege;

        const consumerGroupProperty = this.resourceDetails.find(
          (detail) => detail.key == Constants.Metadata.HasConsumerGroup
        );
        if (consumerGroupProperty && userConsumerGroups) {
          authorized = userConsumerGroups.some(
            (cg) => cg.id == consumerGroupProperty.valueEdge[0]
          );
        }

        const lifeCycleStatusProperty = this.resourceDetails.find(
          (detail) => detail.key == Constants.Metadata.LifeCycleStatus
        );
        if (
          lifeCycleStatusProperty &&
          lifeCycleStatusProperty.valueEdge[0] ==
            Constants.Resource.LifeCycleStatus.MarkedDeletion
        ) {
          authorized = false;
        }

        this.elementRef.nativeElement.style.display = authorized
          ? 'inline-block'
          : 'none';
      })
    );
  }
}
