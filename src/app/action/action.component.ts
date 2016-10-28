import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';


@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
})
export class ActionComponent implements OnInit {
  @Input() action: IAction;
  @Output() finished = new EventEmitter<number | null>();
  time: number;
  statusTimer: NodeJS.Timer;
  alarmTimer: NodeJS.Timer | number;
  playing:boolean = false;
  status: string;
  recur: Later.IRecurrenceBuilder;


  ngOnInit() {
    this.statusTimer = setInterval(() => {
      this.configureTimer();
    }, 1000);
    
    if (this.action.conditions) {
      later.date.localTime();
      this.recur = later.parse.recur();
      for (let cond of this.action.conditions.time) {
        let hours = cond.hours.split("-").map(e => e as any * 1);
        this.recur.and()
            .every().hour().between(hours[0], hours[1])
            .on(...cond.days.split(",").map(e => e as any * 1)).dayOfWeek();
      }
    }
  }

  getNextOccurrence(): number {
    if (this.action.repeat_offset) {
      let cand: Date = new Date(this.action.time + this.action.repeat_offset);
      if (this.recur) cand = later.schedule(this.recur).next(1, cand) as Date;
      return cand.getTime();
    }
    return null;
  }

  configureTimer() {
    this.time = new Date().getTime();

    if (this.action.show_after !== null && this.time > this.action.time + this.action.duration + this.action.show_after) {
      this.status = "finish";
      this.finished.emit(this.getNextOccurrence());
    } else if (this.time > this.action.time + this.action.duration) {
      this.status = "after";
      if (this.action.duration == 0 && !this.alarmTimer && this.action.alarm) {
        this.playing = true;
        this.alarmTimer = 1;
      } 
    } else if (this.time > this.action.time) {
      this.status = "running";
      if (!this.alarmTimer && this.action.alarm) {
        this.playing = true;
        if (this.action.snooze) {
          this.alarmTimer = setInterval(() => {
            console.log('alarmTimer');
            this.playing = true;
          }, this.action.snooze);
        } else {
          this.alarmTimer = 1;
        }
      }
    } else if (this.action.show_before && this.time > this.action.time - this.action.show_before) {
      this.status = "before";
    } else {
      this.status = "hidden";
    }
    if (!(this.status == 'running' || (this.status == "after" && this.action.duration == 0))) {
      clearInterval(this.alarmTimer as NodeJS.Timer);
      this.alarmTimer = null;
      return;
    }

  }
}

interface ITimeCondition {
  hours: string | null;
  days: string | null;
}

interface ICondition {
  time: ITimeCondition[];
}

interface IAction {
  time: number;
  repeat_offset: number;
  show_after: number | null;
  duration: number;
  alarm: string | null;
  snooze: number | null;
  show_before: number | null;
  conditions: ICondition | null;
}