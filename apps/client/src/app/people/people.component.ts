import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, } from '@angular/core';
import { DataService } from './services/data.service';
import { BehaviorSubject, filter, from, map, Observable, of, startWith, tap, withLatestFrom } from 'rxjs';
import { Person } from './types/person';
import { FormBuilder, FormGroup } from '@angular/forms';

const DEFAULT_PLACEHOLDER = 'https://via.placeholder.com/600/ccc';
@Component({
  selector: 'm-prest-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeopleComponent implements OnInit {
  private readonly _store: BehaviorSubject<Person[]> = new BehaviorSubject<Person[]>([]);


  formGroup!: FormGroup;
  currentImageUrl = '';
  searchText = '';

  filteredPeople$: Observable<Person[]> = this._store.asObservable();

  constructor(
    private readonly dataService: DataService,
    private formBuilder: FormBuilder) {

    this.formGroup = this.formBuilder.group({ filter: [''] });

    // destroy subs
    this.dataService.getPeople()
      .subscribe(ppl => this._store.next(ppl));

    // destroy subs
    const filtered$ = this.formGroup.get('filter')?.valueChanges
      .pipe(
        startWith(''),
        withLatestFrom(this.filteredPeople$),
        map(([val, people]) => !val ? people : people.filter((x: Person) => {
          return x
            && x.id.toString().toLowerCase().includes(val)
            || x && x.title.toString().toLowerCase().includes(val);
        }))
      );

  }

  ngOnInit(): void {

  }

  deleteRow(ev: MouseEvent, person: Person) {
    ev.preventDefault();

    const filtered$ = this.filteredPeople$
      .pipe(
        map(people => {
          return people.filter(p => p.id !== person.id);
        })
      )

    this.filteredPeople$ = filtered$;
    this.currentImageUrl = DEFAULT_PLACEHOLDER;
  }

  editRow(ev: MouseEvent, person: Person) {
    ev.preventDefault();
    this.currentImageUrl = person.url;
  }

  selectRow(person: Person) {
    this.currentImageUrl = person.url;
  }
}
