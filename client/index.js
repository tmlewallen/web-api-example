var unirest = require('unirest');
var parser = require('parse-link-header');
var contextRoot = 'http://localhost:4000';
var jsonHeader = {'Accept': 'application/json', 'Content-Type': 'application/json'};

getResourceByPage(contextRoot + '/users');



function getResourceByPage(url){
  console.log(url)
  unirest.get(url)
  .header(jsonHeader)
  .send()
  .end( ( res ) => {
    var page = res.body;
    page.forEach( (element) => {
      getCredentialsForStudentId(element.studentId);
    });
    var links = parser(res.headers.link);
    if (links.next){
      getResourceByPage(links.next.url);
    }
  });
}


function getCredentialsForStudentId(id){
  console.log(id);
  unirest.get(contextRoot + '/credential/' + id)
  .header(jsonHeader)
  .send()
  .end( ( res ) => {
    getLunchNumberForStudentAndUpdateCredentials(id, res.body);
  });
}


function getLunchNumberForStudentAndUpdateCredentials(id, creds){
  const nbr = 1234; //Hard coding this for now
  updateCredentialsForStudent(id, creds, {password:nbr});
}

function updateCredentialsForStudent(id, existingCreds, newCreds){
  for (var key in newCreds){
    existingCreds[key] = newCreds[key];
  }
  unirest.post(contextRoot + '/credential/' + id)
  .headers(jsonHeader)
  .send(existingCreds)
  .end( ( res ) => {
    console.log('Credential update request for id %s returned status code %d', id, res.code);
  });
}