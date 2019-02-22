export default class RouterSchema {
  private _options: {
    isOwned: boolean,
    isProtected: boolean,
  };
  private _route: string;
  private _table: string;

  constructor(options: { isOwned: boolean; isProtected: boolean }, route: string, table: string) {
    this._options = options;
    this._route = route;
    this._table = table;
  }

  get options(): { isOwned: boolean; isProtected: boolean } {
    return this._options;
  }

  set options(value: { isOwned: boolean; isProtected: boolean }) {
    this._options = value;
  }

  get route(): string {
    return this._route;
  }

  set route(value: string) {
    this._route = value;
  }

  get table(): string {
    return this._table;
  }

  set table(value: string) {
    this._table = value;
  }
}
