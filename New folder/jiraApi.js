
var jiraConn = require('./jiraConnection.js');
var JiraClient = require('jira-connector');

var jira = null;
var CSINames = [];

async function generateCEPReport() {
    jira = jiraConn.getJiraClientConnection();
    let startAt = 0;
    let userDtaList = [];
    
    let filteredIssue = [];
    let count = 1;
    for (let i = 0; i < count; i++) {
        let data = await getCSIData(startAt);
        if (!data || !data.issues || data.issues.length == 0) {
            continue;
        } else {
            count++;
        }
        for (let j = 0; j < data.issues.length; j++) {
            userDtaList.push(data.issues);
            
        }
        
        // for(let i=0; i< userDtaList.length;i++){
        //     CSINames.push(userDtaList[i].key);
        // }
        totalIssueCount = data.total;
        startAt = startAt + 50;
        console.log(CSINames + "ads"+ userDtaList);
    }
    console.log("total Records::::" + userDtaList.length)
    
}

async function getCSIData(startAt) {
    var jqiString = 'project = "CSI" AND status was "Inputs Required" AND assignee was "aswalr" and createdDate >= "2019-3-27" AND createdDate< "2019-3-31"';
    return new Promise(function (resolve, reject) {
        jira.search.search({
            startAt: startAt,
            jql: jqiString,
        }, function (error, data) {
            if (error) {
                resolve(error);
            } else {
                resolve(data);
            }
        });
    });
}

generateCEPReport();