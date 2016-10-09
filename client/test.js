var unirest = require('unirest');

getAllCredentials();

function getAllCredentials(){
  //Test to see if everything was updated
  unirest.get('http://localhost:4000/credentials?all=true')
  .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
  .send()
  .end( ( res ) => {
    console.log(res.body);
  });
}