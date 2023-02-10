import { Constants } from '../../../shared/constants';

export const IconMapping: { [key: string]: IconDetailInformation } = {
  [Constants.Resource.LifeCycleStatus.Draft]: {
    icon: 'pencil-alt',
    tooltip: 'Draft',
  },
  [Constants.Resource.LifeCycleStatus.Published]: {
    icon: 'cloud-upload-alt',
    tooltip: 'Published',
  },
  [Constants.Resource.LifeCycleStatus.MarkedDeletion]: {
    icon: 'trash-alt',
    tooltip: 'Marked For Deletion',
  },
};

export interface IconDetailInformation {
  icon: string;
  tooltip: string;
}
