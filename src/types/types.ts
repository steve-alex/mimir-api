export class UserDTO {
  id: number;
  name: string;
}
export class CreateUserDTO {
  name: string;
}

export class UpdateUserDTO {
  id: number;
  name: string;
}

export interface NotionPageDetails {
  title?: string;
  author?: string;
  categories?: string[];
  summary?: string;
  url?: string;
}
