import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Person } from '../types/person';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  static DATA_URL = 'https://jsonplaceholder.typicode.com/albums/2/photos';

  constructor(private readonly httpClient: HttpClient) {
  }

  getPeople(): Observable<Person[]> {
    return this.httpClient.get<Person[]>(DataService.DATA_URL);
  }
}
