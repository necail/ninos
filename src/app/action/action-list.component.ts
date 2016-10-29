import { Component } from '@angular/core';
import { AngularFire, FirebaseListObservable } from 'angularfire2';

@Component({
  selector: 'app-action-list',
  templateUrl: './action-list.component.html'
})
export class ActionListComponent {
  actions: FirebaseListObservable<any[]>;
  stars = [];
  status = {};

  constructor(private af: AngularFire) {
    this.actions = af.database.list('ninos/actions');
    af.database.list('ninos/stars').subscribe(data => {
      this.stars = data.map(kid => {
        return {
          $key: kid.$key,
          stars: Object.keys(kid).filter(k => !k.startsWith('$'))
        };
      });
    });
  }

  isScheduled(action: Object) {
    return 'time' in action;
  }

  checkRunning(action: string): boolean {
    return this.status[action] == 'running';
  }

  onFinish(action: any, time: number) {
    if (time) {
      this.af.database.object(`ninos/actions/${action.$key}`).update({time: time});
    }
  }

  onReady(kid: string, name: string) {
    this.af.database.list(`ninos/stars/${kid}`).push(name);
  }

  onStatus(action: any, status: string) {
    this.status[action.$key] = status;
  }
}
