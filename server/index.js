'use strict'
var express = require('express');
var mockData = require('./data');
var app = express();

var bodyParser = require('body-parser');

var port = 4000;
var url = 'localhost:' + port;


const PAGE_SIZE = 2;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


app.route('/user/:id')
  .get( (req, res) => {
    console.log('GET request at /user/{id} with params %s', JSON.stringify(req.params));
    var id = req.params.id;
    if (!id){
      console.error('No id passed with request. Usage is /user/{id}');
      res.status(400).send();
    }
    else{
      var data  = getUser(id);
      console.log('\tReturning from GET request at /user/%s...', id);
      res.status(200).json(data);
    }
  })
  .post( (req, res) => {
    console.log('POST request at /user with params %s and body %s', 
                JSON.stringify(req.params), JSON.stringify(req.body));
    var id = req.params.id;
    if (!id){
      console.error('No id passed with request. Usage is /user/{id}');
      res.status(400).send();
      return;
    }
    else{
      var data  = getUser(id);
      var resCode = 200;
      if (!data){
        data = {};
        data.studentId = id;
        mockData.users.push(data);
        resCode = 201; //use 201 for created
      }
      for (var key in req.body){
        data[key] = req.body[key];
      }
      console.log('\tReturning from POST request at /user/%s...',id);
      res.status(resCode).send();
    }
  });
  ;

app.route('/credential/:id')
  .get( (req, res) => {
    console.log('GET request at /credential/{id} with params %s', req.params);
    var id = req.params.id;
    if (!id){
      console.error('No id passed with request. Usage is /credential/{id}');
      res.status(400).send();
      return;
    }
    else{
      var data  = getCredential(id);
      console.log('\tReturning from GET request at /credential/%s...',id);
      res.status(200).json(data);
    }
  })
  .post( (req, res) => {
    console.log('POST request at /credential/{id} with params %s and body %s', 
                JSON.stringify(req.params), JSON.stringify(req.body));
    var id = req.params.id;
    if (!id){
      console.error('No id passed with request. Usage is /credential/{id}');
      res.status(400).send();
      return;
    }
    else{
      var data  = getCredential(id);
      var resCode = 200;
      if (!data){
        data = {};
        data.studentId = id;
        mockData.credentials.push(data);
        resCode = 201; //use 201 for created
      }
      for (var key in req.body){
        data[key] = req.body[key];
      }
      console.log('\tReturning from POST request at /credential/%s...',id);
      res.status(resCode).send();
    }
  });

app.route('/credentials')
  .get( (req, res) => {
    console.log('GET request at /credentials with params %s', 
                JSON.stringify(req.query));
    if (req.query.all === 'true'){
      console.log("\tReturning all from GET requets at /credentials...");
      res.status(200).json(mockData.credentials);
      return;
    }
    var page = req.query.page ? parseInt(req.query.page) : 1;
    var maxPageNumber = Math.ceil(mockData.credentials.length/PAGE_SIZE);

    if (page > maxPageNumber){
      res.status(400).send('Page out of bounds');
      return;
    }

    var links = [generateLink('/credentials', {page : page}, 'cur')];
    var data;

    if (page > 1){
      links.push(generateLink('/credentials', {page : page - 1}, 'prev'));
    }

    var ndx = page * PAGE_SIZE - PAGE_SIZE; //Page number begins at 1 - need ndx to start at 0

    if (page < maxPageNumber){
      links.push(generateLink('/credentials', {page : page + 1}, 'next'));
      data = mockData.credentials.slice(ndx , ndx + PAGE_SIZE);
    }
    else { //Already know page is < maxPage from earlier if condition
      data = mockData.credentials.slice(ndx);
    }
    console.log("\tReturning page %d from GET request at /credentials...", page);
    res.append('Link', links);
    res.status(200).json(data);
  });


app.route('/users')
  .get( (req, res) => {
    console.log('GET request at /users with params %s', 
                JSON.stringify(req.query));
    if (req.query.all === 'true'){
      console.log("\tReturning all from GET request at /users...", JSON.stringify(mockData.users));
      res.status(200).json(mockData.users);
      return;
    }
    var page = req.query.page ? parseInt(req.query.page) : 1;
    var maxPageNumber = Math.ceil(mockData.users.length/PAGE_SIZE);

    if (page > maxPageNumber){
      res.status(400).send('Page out of bounds');
      return;
    }

    var links = [generateLink('/users', {page : page}, 'cur')];
    var data;

    if (page > 1){
      links.push(generateLink('/users', {page : page - 1}, 'prev'));
    }

    var ndx = page * PAGE_SIZE - PAGE_SIZE; //Page number begins at 1 - need ndx to start at 0

    if (page < maxPageNumber){
      links.push(generateLink('/users', {page : page + 1}, 'next'));
      data = mockData.users.slice(ndx , ndx + PAGE_SIZE);
    }
    else { //Already know page is < maxPage from earlier if condition
      data = mockData.users.slice(ndx);
    }
    console.log("\tReturning page %d from GET request at /users...", page);
    res.append('Link', links);
    res.status(200).json(data);
  });


app.listen(port, function(){
  console.log('Listening on %d...', port);
});


function generateLink(path, queryParams, rel){
  var templ = '<http://localhost:'+port+path+'?';
  for (var key in queryParams){
    if (templ.charAt(templ.length-1) !== '?'){
      templ += '&';
    }
    templ += key + '=' + queryParams[key];
  }
  templ += '> ; ' + 'rel="' + rel + '"';
  return templ;
}

function getUser(id){
  for (var i = 0; i < mockData.users.length; i++){
    if (mockData.users[i].studentId === id){
      return mockData.users[i];
    }
  }
  return null;
}

function getCredential(id){
  for (var i = 0; i < mockData.credentials.length; i++){
    if (mockData.credentials[i].studentId === id){
      return mockData.credentials[i];
    }
  }
  return null;
}
