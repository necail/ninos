import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
})
export class ActionComponent implements OnInit {
  @Input() action: IAction;
  @Input() checkRunning: (actionName: string) => boolean;
  @Output() onFinished = new EventEmitter<number | null>();
  @Output() onReady = new EventEmitter<string>();
  @Output() onStatus = new EventEmitter<string>();
  time: number;
  statusTimer: NodeJS.Timer;
  alarmTimer: NodeJS.Timer | number;
  playing:boolean = false;
  _status: string;
  debug = !environment.production;

  set status(s: string) {
    if (!(s == 'running' || (s == "after" && this.action.duration == 0))) {
      clearInterval(this.alarmTimer as NodeJS.Timer);
      this.alarmTimer = null;
    }
    this._status = s;
    this.onStatus.emit(s);
  }

  get status(): string {
    return this._status;
  }

  ngOnInit() {
    this.statusTimer = setInterval(() => {
      this.configureTimer();
    }, 200);
  }

  getNextOccurrence(): number {
    let recur: Later.IRecurrenceBuilder;

    if (this.action.conditions) {
      later.date.localTime();
      recur = later.parse.recur();
      for (let cond of this.action.conditions.time) {
        let hours = cond.hours.split("-").map(e => e as any * 1);
        recur.and()
            .every().hour().between(hours[0], hours[1])
            .on(...cond.days.split(",").map(e => e as any * 1)).dayOfWeek();
      }
    }
    if (this.action.repeat_offset) {
      let cand: Date = new Date(Math.max(this.action.time + this.action.repeat_offset, new Date().getTime()));
      if (recur) cand = later.schedule(recur).next(1, cand) as Date;
      return cand.getTime();
    }
    return null;
  }

  configureTimer() {
    this.time = new Date().getTime();

    if (this.action.show_after !== null && this.time > this.action.time + this.action.duration + this.action.show_after) {
      this.status = "finish";
      this.onFinished.emit(this.getNextOccurrence());
    } else if (this.time > this.action.time + this.action.duration) {
      this.status = "after";
      if (this.action.duration == 0 && !this.alarmTimer && this.action.alarm) {
        this.playing = true;
        this.alarmTimer = 1;
      } 
    } else if (this.time > this.action.time) {
      if (this.action.conditions && this.action.conditions.not_running && this.checkRunning) {
        for (let cond of this.action.conditions.not_running) {
          if (this.checkRunning(cond)) {
            this.status = "waiting";
            return;
          }
        }
      }
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
  }
}

interface ITimeCondition {
  hours: string | null;
  days: string | null;
}

interface ICondition {
  time: ITimeCondition[];
  not_running: string[];
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