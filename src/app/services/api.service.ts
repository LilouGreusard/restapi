export class ApiService {
  static api_base_url = 'http://localhost:8080/api';

  static async get(chemin: string): Promise<any> {
    try {
      const response = await fetch(this.api_base_url + chemin);
      if (!response.ok) {
        throw new Error(`Erreur HTTP ! statut : ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors du fetch :', error);
      throw error;
    }
  }

  static async postData(chemin: string, bodyData: any) {
    try {
      const response = await fetch(this.api_base_url + chemin, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Indique que le corps est en JSON
          'Access-Control-Allow-Origin': '*',
          
        },
        body: JSON.stringify(bodyData), // On stringify les données à envoyer
      });
      if (!response.ok) {
        throw new Error(`Erreur HTTP ! statut : ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors du fetch POST :', error);
      throw error;
    }
  }
}
