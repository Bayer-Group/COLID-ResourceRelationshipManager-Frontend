import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { IconMapping } from '../models/icon-mapping';
import { ColidIconsService } from '../services/colid-icons.service';
import { IconTypes } from '../models/icon-types';

@Component({
  selector: 'ds-icon',
  templateUrl: './colid-icons.component.html',
  styleUrls: ['./colid-icons.component.css']
})
export class ColidIconsComponent implements OnInit {

  @Input() icon: string = "";

  @Input() delay: number = 0;

  @Input() tooltip: string = "";

  @Input() tooltipDisabled: boolean = true;

  @Input() iconType: IconTypes = IconTypes.Default;

  iconTypes = IconTypes;

  iconsRegistered = false;

  get encodedIcon(): string {
    return this.appIconService.encodeString(this.icon);
  }

  constructor(private appIconService: ColidIconsService, private changeDetector: ChangeDetectorRef) { }

  ngOnInit() {
    this.appIconService.iconsRegistered$.subscribe(res => {
      this.iconsRegistered = res
      this.changeDetector.detectChanges()
    });
  }

  get iconKey(): string {
    if (this.icon) {
      if (this.iconType === this.iconTypes.Mapping) {
        return IconMapping[this.icon].icon;
      } else if (this.iconType === this.iconTypes.S3) {
        return this.encodedIcon;
      } else {
        return this.icon;
      }
    }
    else {
      return "";
    }
  }


  get label(): string {
    if (this.iconType === this.iconTypes.Mapping) {
      return IconMapping[this.icon].tooltip
    } else if (this.iconType === this.iconTypes.S3) {
      return this.appIconService._tooltipMapping.get(this.iconKey) as string;
    } else {
      return this.tooltip;
    }
  }
}
