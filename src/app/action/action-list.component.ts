import { Component } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';

@Component({
  selector: 'app-action-list',
  templateUrl: './action-list.component.html'
})
export class ActionListComponent {
  actions: FirebaseListObservable<any[]>;
  stars = [];
  time: number;

  constructor(private af: AngularFire) {
    this.actions = af.database.list('ninos/actions', {query: {orderByChild: "time"}});
    af.database.list('ninos/stars').subscribe(data => {
      this.stars = data.map(kid => {
        return {
          $key: kid.$key,
          stars: Object.keys(kid).filter(k => !k.startsWith('$'))
        };
      });
    });
    setInterval(() => {this.time = new Date().getTime()}, 500)
  }

  private timeLeft(action: any, time: number): number {
    if (action.time < this.time - 5000) {
      if (action.snooze) {
        this.af.database.object(`ninos/actions/${action.$key}`)
            .update({time: new Date().getTime() + action.snooze * 1000, snoozed: true});
      } else {
        this.finish(action);
      }
    }
    return action.time - time;
  }

  private finish(action: any){
    if (action.repeat) {
      this.af.database.object(`ninos/actions/${action.$key}`)
          .update({time: new Date().getTime() + action.repeat.every * 1000, snoozed: null});
    } else {
      this.af.database.object(`ninos/actions/${action.$key}`).remove();
    }
  }

  onFinish(action: any, time: number) {
    if (time) {
      this.af.database.object(`ninos/actions/${action.$key}`).update({time: time});
    }
  }

  onClick(action: any) {
    if (action.finishable) {
      this.finish(action);
    }
  }
}
