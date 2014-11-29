App = Ember.Application.create();

Bigdata = [];

App.Router.map(function() {
  // put your routes here
  this.resource('apps', { path: '/' }, function() {
  	this.resource('app', { path: 'app/:app_id' });
  });
  this.resource('about');
});

App.AppsRoute = Ember.Route.extend({
  model: function(params) {
  	return Ember.$.getJSON('https://cdn.rawgit.com/ePirat/TwitAppCheck/v0.1/app_index.json').then(function(data) {
      Bigdata = data;
      return data;
    });
  }
});

var incrementPage = function(amt) {
  return Ember.computed('page', 'numPages', function() {
    var newPage = parseInt(this.get('page'), 10) + amt;
    if (newPage <= parseInt(this.get('numPages'), 10) &&
        newPage >= 1) {
      return newPage;
    }
  });
};

Ember.LinkView.reopen({
  attributeBindings: ['data-toggle', 'data-target']
});

App.ResetScroll = Ember.Mixin.create({
  activate: function() {
    this._super();
    console.log("FOOO");
    window.scrollTo(0,0);
  }
});

App.AppsController = Ember.ArrayController.extend({
  queryParams: ['page', 'pageSize', 'search'],
  page: 1,
  pageSize: 24,

  pages: function() {
    var pageSize = this.get('pageSize');
    var l = this.get('filteredArrangedContent.length');
    var pages = Math.ceil(l / pageSize);
    var pagesArray = [];
  
    for(var i = 0; i < pages; i ++) {
      pagesArray.push(i + 1);
    }
    return pagesArray;
  }.property('pageSize', 'filteredArrangedContent.length'),

  numPages: function() {
    var pageSize = this.get('pageSize');
    var l = this.get('filteredArrangedContent.length');
    return Math.ceil(l / pageSize);
  }.property('pageSize', 'filteredArrangedContent.length'),

  sortProperties: ['name'],
  sortAscending: true,

  shortPages: function() {
    pagesArray = [];
    pagesArray.push(1);
    start = this.get('page');
    end = this.get('numPages');
    start = ((start - 2) <= 2) ? 2 : (start - 2);
    end = ((this.get('page') + 2) < end) ? (this.get('page') + 2) : end;
    if (start > 2) {
      pagesArray.push(null);
    }
    for(var i = start; i <= end; i++) {
      pagesArray.push(i);
    }
    if (end < this.get('numPages') - 1) {
      pagesArray.push(null);
    }
    if (end != this.get('numPages')) {
      pagesArray.push(this.get('numPages'));
    }
    return pagesArray;
  }.property('pageSize', 'filteredArrangedContent.length', 'page'),
    
  paged: function() {
    var page = this.get('page') - 1,
        pageSize = this.get('pageSize'),
        start = page * pageSize,
        end = start + pageSize;
    return this.get('filteredArrangedContent').slice(start, end);
  }.property('page', 'filteredArrangedContent', 'pageSize'),

  previousPage: incrementPage(-1),
  nextPage:     incrementPage(1),

  filteredArrangedContent: function() {
        var search = this.get('search');
        if (!search) { return this.get('arrangedContent') }
        this.set('page', 1);
        return this.get('arrangedContent').filter(function(app) {
          name = app.name.toLowerCase();
          term = search.toLowerCase();
          return name.indexOf(term) != -1;
        })
    }.property('arrangedContent', 'search'),

  actions: {
    search: function() {
      var query = this.get('search');
      console.log(this.search);
      this.set('page', 1);
      this.set('search', query);
    }
  }
});

App.AppRoute = Ember.Route.extend({
	model: function(params) {
    var details = null;
    return jQuery.getJSON('https://cdn.rawgit.com/ePirat/TwitAppCheck/v0.1/app_data/' + params.app_id + '.json').then(function(data) {
      base = Bigdata.findBy('id', params.app_id);
      if (data) {
        data.description = marked(data.description);
        jQuery.extend(base, data);
      }
      return base;
    });
	}
});

App.AppView = Ember.View.extend({
  didInsertElement: function() {
    $('#appModal').modal('show');
    var cont = this.controller;
    $('#appModal').on('hidden.bs.modal', function () {
      cont.transitionToRoute("apps");
    });
  }
})

App.LoadingView = Ember.View.extend({
  didInsertElement: function() {
    var spinner = new Spinner().spin();
    $('#loadingtext').get(0).appendChild(spinner.el);
  }
})
