export const IconMapping : {[key: string]: IconDetailInformation} = {
  'https://pid.bayer.com/kos/19050/draft': { icon: 'pencil-alt', tooltip: 'Draft' },
  'https://pid.bayer.com/kos/19050/published': { icon: 'cloud-upload-alt', tooltip: 'Published' },
  'https://pid.bayer.com/kos/19050/markedForDeletion': { icon: 'trash-alt', tooltip: 'Marked For Deletion' },
}

export interface IconDetailInformation {
  icon: string;
  tooltip: string;
}