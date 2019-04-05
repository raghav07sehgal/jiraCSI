// With ES5
var JiraApi = require('jira-client');
 
// Initialize
var jira = new JiraApi({
  protocol: 'https',
  host: 'jira.hmhco.com',
  username: 'pantn',
  password: 'Neeraj@123',
  apiVersion: '2',
  strictSSL: true
});

// findIssue
jira.findIssue('CSI-55590')
  .then(function(issue) {
  // console.log(issue);
    console.log('Status: ' + issue.fields.status.name);
  })
  .catch(function(err) {
    console.error(err);
  });
  