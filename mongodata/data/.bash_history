mongo -u Admin -p jpablouan1994
mongod -u Admin -p jpablouan1994
mongo
exit
mongo -u Admin -p Jpablouan1994
use admin
db.createUser(
  {     user: "siteUserAdmin",;     pwd: "password",;     roles: [ { role: "userAdminAnyDatabase", db: "admin" } ];   }
exit
