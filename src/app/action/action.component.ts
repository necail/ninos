import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
})
export class ActionComponent implements OnInit {
  @Input() kids: string[];
  @Input() action: string;
  @Input() timer: number;

  actionUrl: string;
  initialTimer:number = 0;

  private actions = {
    potty: "http://www.clipartkid.com/images/27/toilet-clip-art-u7sD9M-clipart.png",
    tidyUp: "https://s-media-cache-ak0.pinimg.com/originals/31/b0/5a/31b05aa68d8a23c840fb998c1f8cc9e0.jpg",
    thinking: "http://www.cliparts101.com/files/287/32A135A382EC8D2D2322C723D15AE083/Man_Thinking.png"
  };

  ngOnInit() {
    this.actionUrl = this.actions[this.action];
    if (this.timer > 0) {
      this.initialTimer = this.timer;
    }
  }
}
