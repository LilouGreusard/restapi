import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { Adresse } from "../models/adresse.model";
import { CodePostal } from "../models/code-postal.model";

@Injectable({
    providedIn: 'root',
})
export class AdresseService {

    constructor() {}
    async getAllCp(): Promise<Array<CodePostal>> {
        return ApiService.get('/adresse/cp/all');
    }
    async getAll(): Promise<Array<Adresse>> {
        return ApiService.get('/adresse/all');
    }
    async getByCodePostalId(codePostalId: number): Promise<Array<Adresse>> {
         return ApiService.get('/adresse/' + codePostalId);
    }
}