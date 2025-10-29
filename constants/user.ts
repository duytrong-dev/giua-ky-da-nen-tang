export interface NewUser {
    username: string;
    email: string;
    image?: string;
    password: string;
}

export interface User extends NewUser {
  id: string;
}
