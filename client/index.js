var unirest = require('unirest');
var parser = require('parse-link-header');
var rootUrl = 'http://localhost:4000';
var jsonHeader = {'Accept': 'application/json', 'Content-Type': 'application/json'};

//Get things started...
getResourceByPage(rootUrl + '/students', iterateOverStudentPage); //we pass in our 'iterateOverStudentPage' function to handle each page

/*
Student Data format - We receive an array of these from '/students' endpoint 
{
    studentId : '0001',
    firstName : 'Mycroft',
    lastName : 'Holmes', 
    age: 12,
    enrolled : true,
    grade : 7
}

Credentials data format - We receive the object that has the studentId we pass to the '/credential/{id}' endpoint
{
    studentId : '0001',
    login : 'MH',
    password : 'password'
}

Accessing properties in a JSON object...
GIVEN 
var obj = {studentId : '0001', login : 'MH', password : 'password'};
THEN
obj.studentId == '0001'
obj.login == 'MH'
obj.password == 'password'
*/

//STEP 1 - Get Students
//Gonna call this recursively to get each page of the student data 
function getResourceByPage(url, pageHandler){
  unirest.get(url) //GET request on passed URL string
  .header(jsonHeader) 
  .send()
  .end( function(res)  {   //This is asyncronous, so instead of waiting for a response, we pass in a function to be executed on it's own when this 'thread'' gets a response
    pageHandler(res.body); //Let the pageHander we passed in (iterateOverStudentPage) do something for each student
    var links = parser(res.headers.link); //The info for the 'next' and 'prev' pages are in the header under the key 'link'. This 'parser' parses the urls of 'next' and 'prev' that are in the header
    if (links.next){ //If our header contains a reference to the url for the next page, let's make a recursive call to get that next page
      getResourceByPage(links.next.url, pageHandler); //Recursive call for next page
    }
  });
}

//STEP 2 - For each student, execute STEP 3
function iterateOverStudentPage(page){ //"Page" is just an array of students
  page.forEach( function(student) { //iterate over page of students
    getCredentialsForStudentId(student.studentId); //Call the next step in our workflow and passing it a studentId
  });
}

//STEP 3 - with a studentId, get that student's credentials and execute STEP 4...
function getCredentialsForStudentId(id){
  unirest.get(rootUrl + '/credential/' + id) //GET request to get credentials for the student with studentId of 'id'
  .header(jsonHeader)
  .send()
  .end( function( res ) { //This is asyncronous, so instead of waiting for a response, we pass in a function to be executed on it's own when this 'thread'' gets a response
    getLunchNumberForStudentAndUpdateCredentials(id, res.body); 
  });
}

//STEP 4 - Get the student's lunch number and with it, execute STEP 5
function getLunchNumberForStudentAndUpdateCredentials(id, creds){
  const nbr = 1234; //Hard coding this for now
  updateCredentialsForStudent(id, creds, {password:nbr}); //We want to change "password" to our nbr
}

//STEP 5 - Copy fields from new credentials to existing credentials, then update the student's credentials on the server
function updateCredentialsForStudent(id, existingCreds, newCreds){
  for (var key in newCreds){
    existingCreds[key] = newCreds[key];
  }
  unirest.post(rootUrl + '/credential/' + id)//Post request to localhost:4000/credential/{id}
  .headers(jsonHeader)
  .send(existingCreds) //We're passing in our new 'credentials' object to replace the current one on the server
  .end( function( response ) { //This is asyncronous, so instead of waiting for a response, we pass in a function to be executed on it's own when this 'thread'' gets a response
    console.log('Credential update request for id %s returned status code %d', id, response.code);
  });
}