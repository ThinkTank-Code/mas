import { Role } from "../../types/role";

export interface IAdmin {
    name: string;
    email: string;
    password: string;
    role: Role;
}
