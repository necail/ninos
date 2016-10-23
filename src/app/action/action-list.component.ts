import { Component } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';

@Component({
  selector: 'app-action-list',
  templateUrl: './action-list.component.html'
})
export class ActionListComponent {
  items: FirebaseListObservable<any[]>;
  stars = [];
  time: number;

  constructor(private af: AngularFire) {
    this.items = af.database.list('ninos/actions', {query: {orderByChild: "time"}});
    af.database.list('ninos/stars').subscribe(data => {
      this.stars = data.map(kid => {
        return {
          $key: kid.$key,
          stars: Object.keys(kid).filter(k => !k.startsWith('$'))
        };
      });
    });
    setInterval(() => {this.time = this.timer()}, 500)
  }

  private timer() {
    return new Date().getTime();
  }

  private timeLeft(item: any, time: number): number {
    if (item.time < this.time - 5000) {
      if (item.snooze) {
        this.af.database.object(`ninos/actions/${item.$key}`)
            .update({time: new Date().getTime() + item.snooze * 1000, snoozed: true});
      } else {
        this.finish(item);
      }
    }
    return item.time - time;
  }

  private finish(item: any){
    if (item.repeat) {
      this.af.database.object(`ninos/actions/${item.$key}`)
          .update({time: this.timer() + item.repeat.every * 1000, snoozed: null});
    } else {
      this.af.database.object(`ninos/actions/${item.$key}`).remove();
    }
  }

  onClick(item: any) {
    if (item.finishable) {
      this.finish(item);
    }
  }
}
