import { BrowserModule } from '@angular/platform-browser';
import { RouterModule }   from '@angular/router';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AngularFireModule } from 'angularfire2'


import { AppComponent } from './app.component';
import { ActionComponent } from './action/action.component';
import { ActionListComponent } from './action/action-list.component';
import { AdminComponent } from './admin/admin.component';

export const firebaseConfig = {
  apiKey: "AIzaSyDk7tqiop3qupxCUDtJ6YMEE0e2SvV3x00",
  authDomain: "fiery-inferno-6665.firebaseapp.com",
  databaseURL: "https://fiery-inferno-6665.firebaseio.com",
  storageBucket: "fiery-inferno-6665.appspot.com",
  messagingSenderId: "1069801040899"
};

@NgModule({
  declarations: [
    AppComponent,
    ActionComponent,
    ActionListComponent,
    AdminComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot([
      { path: 'admin', component: AdminComponent },
      { path: '', component: ActionListComponent }
    ]),
    AngularFireModule.initializeApp(firebaseConfig)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
