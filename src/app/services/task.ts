import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private api = 'http://localhost:3001/tasks';

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