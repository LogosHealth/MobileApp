export class HistoryModel {
  populars: Array<HistoryItemModel>;
  categories: Array<HistoryItemModel>;
  banner_title: string;
  banner_image: string;
}

export class HistoryItemModel {
  title: string;
  image: string;
  profileid: string;
}
