import { ChangeDetectionStrategy, Component, Inject, OnInit, } from '@angular/core';
import { DataService } from './services/data.service';
import {
  BehaviorSubject,
  combineLatestWith,
  map,
  Observable,
  ReplaySubject,
  startWith,
  takeUntil,
  withLatestFrom
} from 'rxjs';
import { Person } from './types/person';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
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
  private DEFAULT_PLACEHOLDER = 'https://via.placeholder.com/600/ccc';
  private readonly store$: BehaviorSubject<Person[]> = new BehaviorSubject<Person[]>([]);

  filter!: FormControl;
  filter$!: Observable<string>;


  formGroup!: FormGroup;
  currentImageUrl = '';
  searchText = '';

  filteredPeople$: Observable<Person[]> = this.store$.asObservable();

  constructor(
    @Inject(DestroyService) private readonly destroy$: DestroyService,
    private readonly dataService: DataService,
    private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.dataService.getPeople()
      .pipe(
        takeUntil(this.destroy$)
      ).subscribe(ppl => this.store$.next(ppl));

    this.filter = new FormControl('');
    this.filter$ = this.filter.valueChanges;

    this.filteredPeople$ = this.filter$
      .pipe(
        startWith(''),
        combineLatestWith(this.store$, this.filteredPeople$),
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
    this.store$
      .pipe(takeUntil(this.destroy$))
      .subscribe(ppl => {
        ppl.splice(0, 0, {
          editMode: true,
          title: '',
          id: Number(ppl[ppl.length - 1].id + 1).toString(),
          albumId: ppl[0].albumId,
          url: '',
          thumbnailUrl: this.DEFAULT_PLACEHOLDER
        })
      });
  }
}
