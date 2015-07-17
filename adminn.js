
  Blogs = new Mongo.Collection('blogs');

  Content = new Mongo.Collection ('content');

//Script running on Client
if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Router.route('/', function () {
    this.render('hello');
  });

  Router.route('/posts', {
    name: 'posts',
    layoutTemplate: 'listBlogs'
  });

  Router.route('/post',{
    name: 'post',
    layoutTemplate: 'blog'
  });

  Router.route('/view/',{
    name:'view',
    layouTemplate: 'viewPost'
  });


    Template.listBlogs.helpers({
    blogs: function () {
      return Blogs.find();
    }
  });

  Template.listBlogs.events({

    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
      blogs.update(this._id, {
        $set: {checked: ! this.checked}
      });
    },
    "click .delete": function () {
      blogs.remove(this._id);
    }
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


  Template.blog.events({

    'submit form': function (e, tmpl) {
      e.preventDefault();

      var title = tmpl.find('#blogTitle').value,
          body = tmpl.find('#blogBody').value;

      Meteor.call('submitPost', title, body);

    }
  })

  Template.listBlogs.helpers = function () {
    return Blogs.find();
  }

} // End of Client Script

//Script running on Server
if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

  Meteor.methods({
    'submitPost': function  ( title , body ) {
      console.log(title);
      console.log(body);

      Blogs.insert({
        title: title,
        body: body
      });
    }
  });

} // End of Server Script 
