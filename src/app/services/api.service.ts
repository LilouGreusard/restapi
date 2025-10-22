export class ApiService {
  static baseUrl = 'http://localhost:8080/api';

  static async get(endpoint: string): Promise<any> {
    const token = localStorage.getItem('TOKEN'); 
    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: headers,
      });
      if (!res.ok) throw new Error(`Erreur HTTP ! statut : ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Erreur lors du fetch :', err);
      throw err;
    }
  }

  static async postData(endpoint: string, data: any): Promise<any> {
    const token = localStorage.getItem('TOKEN');
    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Erreur HTTP ! statut : ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Erreur lors du fetch POST :', err);
      throw err;
    }
  }
}
