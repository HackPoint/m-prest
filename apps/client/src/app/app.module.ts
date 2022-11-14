import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { PeopleComponent } from './people/people.component';
import { CommonModule } from '@angular/common';
import { DataService } from './people/services/data.service';
import { HttpClientModule } from '@angular/common/http';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent, PeopleComponent],
    imports: [
        BrowserModule,
        CommonModule,
        HttpClientModule,
        ScrollingModule,
        ReactiveFormsModule,
        FormsModule
    ],
  providers: [DataService],
  bootstrap: [AppComponent],
})
export class AppModule {}
