export class SettingsModel {
  populars: Array<SettingsItemModel>;
  categories: Array<SettingsItemModel>;
  banner_title: string;
  banner_image: string;
}

export class SettingsItemModel {
  title: string;
  image: string;
  profileid: number;
  checked: string;
}
