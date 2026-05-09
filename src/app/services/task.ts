import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private api = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getTasks() {
    return this.http.get(this.api);
  }

  createTask(data: any) {
    return this.http.post(this.api, data);
  }

  deleteTask(id: string) {
    return this.http.delete(`${this.api}/${id}`);
  }
}