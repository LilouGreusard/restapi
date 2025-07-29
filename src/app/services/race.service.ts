import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { Race } from "../models/race.model";

@Injectable({
    providedIn: 'root',
})
export class RaceService {

    constructor() {}
    async getAll(): Promise<Array<Race>> {
        return ApiService.get('http://localhost:8080/api/race/all');
    }
    async getByEpeceId(especeId: number): Promise<Array<Race>> {
         return ApiService.get('http://localhost:8080/api/race/espece/' + especeId);
        
    }
}