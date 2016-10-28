import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AngularFire, FirebaseListObservable } from 'angularfire2';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styles: []
})
export class AdminComponent {
  items: FirebaseListObservable<any[]>;
  stars = [];

  constructor(private af: AngularFire) {
    this.items = af.database.list('ninos/actions', {query: { orderByChild: "time" }});
    af.database.list('ninos/stars').subscribe(data => {
      this.stars = data.map(kid => {
        return {
          $key: kid.$key,
          stars: Object.keys(kid).filter(k => !k.startsWith('$'))
        };
      });
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

  removeStar(kid: string, star: string) {
    this.af.database.object(`ninos/stars/${kid}/${star}`).remove();
  }

  date(t: number): Date {
    return new Date(t);
  }

  onSubmit(form: NgForm): boolean {
    alert(JSON.stringify(form.value));
    return false;
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
