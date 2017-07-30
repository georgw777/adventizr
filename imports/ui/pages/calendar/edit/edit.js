import { Calendars } from '/imports/api/calendars/calendars.js';
import { CalendarFiles } from '/imports/api/calendar-files/calendar-files.js';
import { Meteor } from 'meteor/meteor';
import './edit.html';
import './info-form/info-form.js';
import './background-form/background-form.js';
import './size-form/size-form.js';

import interact from 'interactjs';

Template.calendar_edit.onCreated(function() {
  Meteor.subscribe('calendars.all');
  Meteor.subscribe('files.calendar.all');
  this.calendar = new ReactiveVar(null);
  this.selectedDoor = new ReactiveVar(null);
});

Template.calendar_edit.onRendered(function() {
  this.autorun(() => {
    var id = FlowRouter.getParam('_id');
    var calendar = Calendars.findOne(id);
    if (
      calendar &&
      calendar.background &&
      CalendarFiles.findOne(calendar.background)
    )
      calendar.backgroundImage = CalendarFiles.findOne(
        calendar.background
      ).link();
    this.calendar.set(calendar);
  });
  this.autorun(() => {
    var number = this.selectedDoor.get()
      ? this.selectedDoor.get().number
      : null;
    if (this.calendar.get())
      this.calendar.get().doors.forEach(function(door) {
        if (document.getElementById('door' + door.number))
          document.getElementById('door' + door.number).style.borderStyle =
            door.number == number ? 'dashed' : 'solid';
      }, this);
  });
  interact('.resize-drag')
    .draggable({
      inertia: false,
      onmove: onMove
    })
    .resizable({
      preserveAspectRatio: false,
      edges: { left: true, right: true, bottom: true, top: true }
    })
    .on('resizemove', onResizeMove);
});

Template.calendar_edit.helpers({
  calendar() {
    return Template.instance().calendar.get();
  },
  selectedDoor() {
    return Template.instance().selectedDoor.get();
  }
});

Template.calendar_edit.events({
  'mousedown .door'(event, template) {
    var target = event.target.classList.contains('door')
      ? event.target
      : event.target.parentElement;
    var number = template.selectedDoor.get()
      ? template.selectedDoor.get().number
      : null;
    selectDoor(target.getAttribute('data-door-number'));
  },
  'mousedown .door-background'(event, template) {
    selectDoor(null);
  }
});

function onMove(event) {
  event.target.style.left =
    parseInt(event.target.style.left, 10) + event.dx + 'px';
  event.target.style.top =
    parseInt(event.target.style.top, 10) + event.dy + 'px';
}

function onResizeMove(event) {
  // Update the element's style, forcing minimum width
  let width = parseInt(event.rect.width, 10),
    height = parseInt(event.rect.height, 10);
  event.target.style.width = (width > 30 ? width : 30) + 'px';
  event.target.style.height = (height > 30 ? height : 30) + 'px';

  // Translate when resizing from top or left edges
  event.target.style.left =
    parseInt(event.target.style.left, 10) +
    parseInt(event.deltaRect.left, 10) +
    'px';
  event.target.style.top =
    parseInt(event.target.style.top, 10) +
    parseInt(event.deltaRect.top, 10) +
    'px';
}

function selectDoor(number) {
  console.log(number);
  Template.instance().selectedDoor.set(
    number
      ? Template.instance()
          .calendar.get()
          .doors.find(element => element.number == number)
      : null
  );
}
