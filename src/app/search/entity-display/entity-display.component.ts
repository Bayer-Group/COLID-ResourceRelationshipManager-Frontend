import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MetaDataProperty } from '../../shared/models/meta-data-property';
import { MetadataExtension } from '../../shared/extensions/metadata.extensions';
import { Constants } from '../../shared/constants';
import { VersionProperty } from '../../shared/models/version-property';
import { Entity } from '../../shared/models/entity';

@Component({
  selector: 'app-entity-display',
  templateUrl: './entity-display.component.html',
  styleUrls: ['./entity-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityDisplayComponent {
  @Input() metadata: Array<MetaDataProperty>;
  @Input() entity: Entity;
  @Input() entityVersions: Array<VersionProperty>;

  constructor() {}

  isVisibleMetadataGroup(key: string) {
    return !MetadataExtension.isInvisbleGroupKey(key);
  }

  isAttachmentGroup(key: string) {
    return key === Constants.Resource.Groups.Images;
  }
}
