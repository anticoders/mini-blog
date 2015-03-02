
var doUpdate = _.debounce(function (postId, updates, done) {
  BlogPosts.update({ _id: postId }, { $set: updates }, done);
}, 500);

Template.chunkEditor.events({
  'keyup textarea': function (e, t) {
    var controller = Iron.controller();
    var updates = {};
    var blogPost = Template.parentData();
    if (this.index === undefined) {
      throw new Meteor.Error('chunk without an index may not be edited');
    }
    if (!blogPost) {
      throw new Meteor.Error('parentData for chunk editor should be a blog post');
    }
    if (controller && controller.hint) {
      controller.hint.set('saving ...');
    }
    updates['chunks.' + this.index + '.content'] = t.$('textarea').val();
    doUpdate(blogPost._id, updates, function () {
      if (controller && controller.hint) {
        controller.hint.set('saving done!');
      }
    });
  },
  'dragover textarea': function (e, t) {
    e.originalEvent.dataTransfer.dropEffect = 'copy';
    e.preventDefault();
    return false;
  },
  'drop textarea': function (e, t) {
    var blogPost = Template.parentData();
    if (!blogPost) {
      throw new Meteor.Error('parentData for chunk editor should be a blog post');
    }
    var listOfIds = addPlaceholders(e.originalEvent, blogPost._id, this, t.$('textarea').val());
    uploadImages(e.originalEvent, function (listOfResults) {
      var content = t.$('textarea').val();
      _.each(listOfIds, function (id, index) {
        if (listOfResults[index].value) {
          content.replace(new RegExp('\[Uploading ' + id + '\]\(.*\)'), 'Uploaded as ' + listOfResults[index].value);
        } else {
          content.replace(new RegExp('\[Uploading ' + id + '\]\(.*\)'), listOfResults[index].error.toString());
        }
      });
      console.log('done uploading');
      console.log(listOfResults);
    });
    e.preventDefault();
    return false;
  },
});

var uploadImages = function (event, callback) {
  var dt = event.dataTransfer;
  if (!dt || !dt.files) {
    return callback && callback([]);
  }
  var listOfResults = [];
  var pending = dt.files.length;
  _.each(dt.files, function (file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      Meteor.call('uploadToS3', e.target.result, file.type, function (err, key) {
        pending -= 1;
        if (err) {
          App.error(err);
          listOfResults.push({ error: err });
        } else {
          listOfResults.push({ value: key });
        }
        if (pending === 0) {
          callback && callback(listOfResults);
        }
      });
    }
    reader.readAsBinaryString(file);
  });
}

var addPlaceholders = function (event, postId, chunk, content) {
  var dt = event.dataTransfer;
  if (!dt || !dt.files) {
    return;
  }
  var listOfIds = [];
  var updates = {};
  if (chunk.index === undefined) {
    throw new Meteor.Error('chunk without an index may not be edited');
  }
  updates['chunks.' + chunk.index + '.content'] = content + '\n' + _.map(dt.files, function (file, index) {
    var id = Random.id();
    listOfIds.push(id);
    return '![Uploading ' + id + '](/path/to/some/file)';
  }).join('\n');
  BlogPosts.update({ _id: postId }, { $set: updates });
  return listOfIds;
}

