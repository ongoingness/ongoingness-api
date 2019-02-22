export class Reply {
  constructor(public code: number,
              public message: string,
              public errors: boolean,
              public payload: any) {}
}
