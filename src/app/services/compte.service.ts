import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { User } from "../models/compte.model";

@Injectable({
    providedIn: 'root',
})
export class CompteService {

    constructor() { }
    async getAll(): Promise<Array<User>> {
        return ApiService.get('/users/all');
    }
    async getById(userId: number): Promise<Array<User>> {
        return ApiService.get('/users/'+ userId);  
    }
}