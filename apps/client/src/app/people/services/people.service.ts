import { Injectable } from '@angular/core';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class PeopleService {

  constructor(private readonly dataService: DataService) { }
}
