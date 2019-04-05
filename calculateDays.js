var searchApi = require('./jiraSearch.js');
var se = null;
var issue ;
generateUserLogsReport();

function generateUserLogsReport() {
se = searchApi.getJiraClientConnection(issue);
console.log("hey"+se);
}


