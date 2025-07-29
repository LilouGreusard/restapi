import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { Nature } from "../models/nature.model";

@Injectable({
    providedIn: 'root',
})
export class NatureService {

    constructor() { }
    async getAll(): Promise<Array<Nature>> {
        return ApiService.get('http://localhost:8080/api/nature/all');
    }
}