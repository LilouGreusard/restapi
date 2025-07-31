import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { Espece } from "../models/espece.model";

@Injectable({
    providedIn: 'root',
})
export class EspeceService {

    constructor() { }
    async getAll(): Promise<Array<Espece>> {
        return ApiService.get('/espece/all');
    }
}