import { Calendars } from '/imports/api/calendars/calendars.js';
import { Meteor } from 'meteor/meteor';
import './edit.html';

Template.calendar_edit.onCreated(() => {
  Meteor.subscribe('calendars.all');
});

Template.calendar_edit.helpers({
  calendar() {
    var id = FlowRouter.getParam("_id");
    return Calendars.findOne(id);
  }
});

Template.calendar_edit.events({
  'submit'(event) {
    event.preventDefault();
    Meteor.call('calendars.update', FlowRouter.getParam("_id"), event.target.title.value, event.target.description.value);
    // TODO: display success alert
  }
});