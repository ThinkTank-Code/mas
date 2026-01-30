export interface IAuthUser {
    id: string;
    name: string;
    email: string;
    role: string;
    securityCode?: string;
}