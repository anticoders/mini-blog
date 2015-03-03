Template.blogPostEdit.created = function () {
  this.$lastFocused = null; //stores reference to last focused chunk input
};

Template.blogPostEdit.rendered = function () {
  var that = this;

  // init sortable plugin with sort events
  this.$('.chunks-container').sortable({
    axis: 'y',
    handle: '.sort-chunk-handler',
    items: '> .chunkEditor',
    start: function(e, ui) {
      that.indexBeforeSort = ui.item.index();
    },
    stop: function(e, ui) {
      var indexAfterSort = ui.item.index();
      var chunkArray = that.data.chunks;
      Helpers.moveInArray(chunkArray, that.indexBeforeSort, indexAfterSort); //move element at new index in-place
      BlogPosts.update({ _id: that.data._id }, { $set: { chunks: chunkArray } });
    }
  });
};

Template.blogPostEdit.destroyed = function () {
  this.$('.chunks-container').sortable('destroy');
};

Template.blogPostEdit.events({

});
