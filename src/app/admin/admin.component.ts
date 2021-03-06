import { Component } from '@angular/core';
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
    this.items = af.database.list('ninos/actions');
    af.database.list('ninos/stars').subscribe(data => {
      this.stars = data.map(kid => {
        return {
          $key: kid.$key,
          stars: Object.keys(kid).filter(k => !k.startsWith('$'))
        };
      });
    });
  }

  now(item: any) {
    this.af.database.object(`ninos/actions/${item.$key}`).update({time: (new Date().getTime() + item.show_before)});
  }

  finish(item: any) {
    this.af.database.object(`ninos/actions/${item.$key}`).update({time: -1});
  }

  saveAction(action: string) {
    let actionO = JSON.parse(action);
    if (action) {
      this.af.database.object(`ninos/actions/${actionO.name}`).set(actionO);
    } else {
      alert("invalid action");
    }
  }

  star(kid: string) {
    this.af.database.list(`ninos/stars/${kid}`).push(1);
  }

  removeStar(kid: string, star: string) {
    this.af.database.object(`ninos/stars/${kid}/${star}`).remove();
  }

  jsonify(o: any) {
    delete o.$key;
    return JSON.stringify(o);
  }

}
