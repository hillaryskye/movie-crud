var routes = require('routes')(),
        fs = require('fs'),
      view = require('mustache'),
      mime = require('mime'),
        db = require('monk')('localhost/movies'),
    movies = db.get('movies'),
        qs = require('qs'),
      view = require('./view')

routes.addRoute('/', (req, res, url) => {
  console.log(url.route)
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html')
    movies.find({}, function (err, docs) {
      if (err) res.end('ooops from the home page')
      var template = view.render('movies/home', docs)
      res.end(template)
    })
  }
})

routes.addRoute('/movies', (req, res, url) => {
  console.log(url.route)
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html')
    movies.find({}, function (err, docs) {
      if (err) res.end('oops from root')
      var template = view.render('movies/index', { movies: docs})
      res.end(template)
    })
  }

  if (req.method === 'POST') {
    var data = ''

    req.on('data', function (chunk) {
      data += chunk
    })

    req.on('end', function () {
      var movie = qs.parse(data)
      movies.insert(movie, function (err, doc) {
        if (err) res.end('oops from insert')
        res.writeHead(302, {'Location': '/movies'})
        res.end()
      })
    })
  }
})

routes.addRoute('/movies/new', (req, res, url) => {
  console.log(url.route)
  if (req.method == 'GET') {
    res.setHeader('Content-Type', 'text/html')
    var template = view.render('movies/new', {})
    res.end(template)
    }
  })

routes.addRoute('/movies/:id', (req, res, url) => {
  console.log(url.route)
  console.log(url.params.id)
  if (req.method === 'GET') {
    movies.findOne({ _id: url.params.id }, function (err, docs) {
    if (err) console.log('fucked up')
    var template = view.render('/movies/show', docs)
    console.log('template', template)
    res.end(template)
    })
  }
})

routes.addRoute('/movies/:id/edit', (req, res, url) => {
  console.log(url.route)
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/html')
    movies.findOne({ _id: url.params.id }, function (err, doc) {
      if (err) console.log('fucked up')
      var template = view.render('movies/edit', doc)
      res.end(template)
    })
  }
})

routes.addRoute('/movies/:id/delete', (req, res, url) => {
  console.log(url.route)
  if (req.method === 'POST') {
    movies.remove({ _id: url.params.id }, function (err, doc) {
      if (err) console.log (err)
      res.writeHead(302, {'Location': '/movies'})
      res.end()
    })
  }
})

routes.addRoute('/movies/:id/update', function (req, res, url) {
  var data = ''
  req.on('data', function (chunk) {
    data += chunk
  })

  req.on('end', function () {
    var movie = qs.parse(data)
    movies.update({ _id: url.params.id }, movie, function (err, doc) {
      res.writeHead(302, {'Location': '/movies'})
      res.end()
    })
  })
})

routes.addRoute('/public/*', function (req, res, url) {
  res.setHeader('Content-Type', mime.lookup(req.url))
  fs.readFile('.' + req.url, function (err, file) {
    if (err) {
      res.setHeader('Content-Type', 'text/html')
      res.end('404 from public')
    }
    res.end(file)
  })
})

module.exports = routes
