import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, } from '@angular/core';
import { DataService } from './services/data.service';
import { BehaviorSubject, filter, from, map, Observable, of, startWith, takeUntil, tap, withLatestFrom } from 'rxjs';
import { Person } from './types/person';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DestroyService } from './services/destroy.service';


@Component({
  selector: 'm-prest-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    DestroyService
  ]
})
export class PeopleComponent implements OnInit {
  private readonly _store: BehaviorSubject<Person[]> = new BehaviorSubject<Person[]>([]);
  private DEFAULT_PLACEHOLDER = 'https://via.placeholder.com/600/ccc';

  formGroup!: FormGroup;
  currentImageUrl = '';
  searchText = '';

  filteredPeople$: Observable<Person[]> = this._store.asObservable();

  constructor(
    @Inject(DestroyService) private readonly destroy$: DestroyService,
    private readonly dataService: DataService,
    private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.formGroup = this.formBuilder.group({ filter: [''] });

    // todo: destroy subs
    this.dataService.getPeople()
      .pipe(takeUntil(this.destroy$))
      .subscribe(ppl => this._store.next(ppl));

    // destroy subs
    this.formGroup.get('filter')?.valueChanges
      .pipe(
        startWith(''),
        withLatestFrom(this.filteredPeople$),
        takeUntil(this.destroy$),
        map(([val, people]) => !val ? people : people.filter((x: Person) => {
          return x
            && x.id.toString().toLowerCase().includes(val)
            || x && x.title.toString().toLowerCase().includes(val);
        }))
      );

  }

  deleteRow(ev: MouseEvent, person: Person) {
    ev.preventDefault();
    const filtered$ = this.filteredPeople$
      .pipe(
        takeUntil(this.destroy$),
        map(people => {
          return people.filter(p => p.id !== person.id);
        })
      );

    this.filteredPeople$ = filtered$;
    this.currentImageUrl = this.DEFAULT_PLACEHOLDER;
  }

  editRow(ev: MouseEvent, person: Person) {
    ev.preventDefault();
    this.currentImageUrl = person.url;
    person.editMode = !person.editMode;
  }

  selectRow(person: Person) {
    this.currentImageUrl = person.url;
  }

  clearInput() {
    this.formGroup.get('filter')?.setValue('');
  }

  addPerson() {
    this._store
      .pipe(takeUntil(this.destroy$))
      .subscribe(ppl => {
        ppl.push({
          editMode: true,
          title: '',
          id: Number(ppl[ppl.length - 1].id + 1).toString(),
          albumId: ppl[0].albumId,
          url: '',
          thumbnailUrl: ''
        });
        ppl.sort((a, b) => {
          return Number(b.id) - Number(a.id);
        });
      });
  }
}
