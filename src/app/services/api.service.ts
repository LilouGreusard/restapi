export class ApiService {
    
    static async get(chemin: string): Promise<any> {
        try {
            const response = await fetch(chemin);
            if (!response.ok) {
                throw new Error(`Erreur HTTP ! statut : ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Erreur lors du fetch :", error);
            throw error;
        }
    }
}