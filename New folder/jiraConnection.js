
// get an instance of the jira connector
var JiraClient = require('jira-connector');
// var property = require('../utils/property.json');

// create jira connection
exports.getJiraClientConnection = function () {
    return new JiraClient({ host: "jira.hmhco.com", basic_auth: { username: "pantn", password: "Neeraj@123" } });
}
