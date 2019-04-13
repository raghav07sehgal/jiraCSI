var search = require('jira-search');
var localStorage = require('localStorage');
let calculateDays = require("./calculateDays.js")
var startDate, endDate;

exports.searchApi = function (startDate, endDate) {
}
search(
  {
    serverRoot: 'https://jira.hmhco.com', // the base URL for the JIRA server
    user: 'pantn', // the user name
    pass: 'Neeraj@123', // the password
    jql: 'project = "CSI" AND status was "Inputs Required" AND assignee was in (aswalr) and createdDate >= "2019-3-01" AND createdDate< "2019-3-31"', // the JQL
    fields: '*all', // the fields parameter for the JIRA search
    expand: 'changelog', // the expand parameter for the JIRA search
    maxResults: 10, // the maximum number of results for each request to JIRA, multiple requests will be made till all the matching issues have been collected
    onTotal: function (total) {
      // optionally initialise a progress bar or something
    },
    mapCallback: function (issue) {
      calculateDays.setData(issue);
    }
  }).then(function (issues) {
    //   // consume the collected issues array here
  }).done();

