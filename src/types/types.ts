export interface Response<T> {
  data?: T;
  message: string;
  statusCode: number;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  time?: number;
}
