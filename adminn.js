
//Script running on Client
if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);


  Router.route('/', function () {
    this.render('hello');
  });

    Router.route('/posts/:_id', {
    name: 'post',
    layoutTemplate: 'layout'
  });

    Router.route('/posts', {
    name: 'post',
    layoutTemplate: 'layout'
  });


  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });

  orion.dictionary.addDefinition('description', 'site', {
      type: String,
      label: 'Description'
  });


  orion.pages.addTemplate({
      layout: ReactiveTemplates.get('layout'),
      template: 'Blogs', 
      name: 'Blogs',
      description: 'Simple template'
  }, {
      content: orion.attribute('froala', {
        label: 'Content'
      })
  })

  var files = $('input').files;
  var upload = orion.filesystem.upload({
    fileList: files,
    name: files[0].name
  });
  Tracker.autorun(function () {
    if (upload.ready()) {
      console.log(upload.fileId)
    }
  });
  Tracker.autorun(function () {
    var progress = upload.progress();
    console.log(progress);
  });


  Template.Blogs.helpers({
    doSave: function () {
      var self = this;
      return function (e, editor) {
        // Get edited HTML from Froala-Editor
        var newHTML = editor.getHTML();
        // Do something to update the edited value provided by the Froala-Editor plugin, if it has changed:
        if (!_.isEqual(newHTML, self.myDoc.myHTMLField)) {
          console.log("onSave HTML is :"+newHTML);
          myCollection.update({_id: self.myDoc._id}, {
            $set: {myHTMLField: newHTML}
          });
        }
        return false; // Stop Froala Editor from POSTing to the Save URL
      }
    }
  })


  Posts = new Mongo.Collection("posts");

  Meteor.subscribe("posts");

  function n(n){
      return n > 9 ? "" + n: "0" + n;
  }

  Template.body.events({
    "submit .new-post": function (event) {

      var text = event.target.text.value;

      Meteor.call("addPost", text);

      event.target.text.value = "";

      return false;
    }
  });

  Template.body.helpers({
    posts: function () {
      return Posts.find({}, {sort: {createdAt: -1}, limit: 10});
    },
    isLogged: function () {
      if (Meteor.user()) {
        return true;
      }
      return false;
    }
  });

  Template.post.helpers({
    isOwner: function () {
      if (Meteor.user()) {
        if (Meteor.user().username == this.username) {
          return true;
        }
      }
      return false;
    },
    pretiffyDate: function(dt) {
      window.t = dt;
      var time = n(dt.getDate()) + '/' + n(dt.getMonth()) + '/' + n(dt.getFullYear()) + ' às ';
      time += n(dt.getHours()) + ':' + n(dt.getMinutes()) + ':' + n(dt.getSeconds());
      return  time;
    }
  });

  Template.post.events({
    "click .btn-delete": function (event) {
      var confirmed = confirm('Tem certeza que deseja apagar o post?');
      if (confirmed)
        Meteor.call('removePost', this._id);
    }
  });



} // End of Client Script

//Script running on Server
if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

  Posts = new Mongo.Collection("posts");

  Meteor.methods({
    addPost: function (text) {
      if (! Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
      }

      Posts.insert({
        text: text,
        owner: Meteor.userId(),
        username: Meteor.user().username,
        createdAt: new Date()
      });
    },

    removePost: function (postId) {
      post = Posts.findOne(postId);
      if (post.owner != Meteor.userId()) {
        throw new Meteor.error("not-authorized");
      }

      Posts.remove(postId);
    }
  });

  Meteor.publish("posts", function () {
    return Posts.find({}, {sort: {createdAt: -1}, limit: 10});
  });

} // End of Server Script 
