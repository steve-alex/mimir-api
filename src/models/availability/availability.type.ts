export interface IAvailability {
  accountId: number;
  deleted: boolean;
}

export interface AvailabilityDTO {
  id?: number;
  accountId?: number;
  deleted?: boolean;
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
}

export interface CreateAvailabilityDTO {
  availability: AvailabilityDTO;
  idsToDelete: number[];
}
