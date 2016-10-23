import { Component } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styles: []
})
export class AdminComponent {
  items: FirebaseListObservable<any[]>;

  constructor(private af: AngularFire) {
    this.items = af.database.list('ninos/actions', {
      query: {
        orderByChild: "time"
      }
    });
  }

  delete(item: any) {
    this.af.database.object(`ninos/actions/${item.$key}`).remove();
  }

  snooze(item: any) {
    if (item.snooze) {
      this.af.database.object(`ninos/actions/${item.$key}`)
          .update({time: new Date().getTime() + item.snooze * 1000, snoozed: true});
    } else {
      this.delete(item);
    }
  }

  finish(item: any) {
    if (item.repeat) {
      this.af.database.object(`ninos/actions/${item.$key}`)
          .update({time: new Date().getTime() + item.repeat.every * 1000, snoozed: null});
    } else {
      this.delete(item);
    }
  }

  star(kid: string) {
    this.af.database.list(`ninos/stars/${kid}`).push(1);
  }

  addThinking(kid: string, time: number) {
    this.items.push({
      alarm: true,
      kids: kid.split(","),
      action: "thinking",
      finishable: false,
      time: new Date().getTime() + time * 1000,
      snoozed: true,
    });
  }

  addTidyUp(kid: string) {
    this.items.push({
      alarm: true,
      snooze: 60,
      kids: kid.split(","),
      action: "tidyUp",
      finishable: false,
      time: new Date().getTime(),
    });
  }

  addPotty(kid: string, repeat: number) {
    this.items.push({
      alarm: true,
      snooze: 20,
      kids: kid.split(","),
      action: "potty",
      finishable: true,
      time: new Date().getTime(),
      repeat: { every: repeat },
    });
  }
}
