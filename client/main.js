
Template.body.rendered = function () {
  this.$('body').addClass('pushable');
}

Template.body.events({
  'click [data-action=scrollTop]': function () {
    $('body').scrollTop(0);
  }
});
