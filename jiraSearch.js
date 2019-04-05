var search = require('jira-search');
var fromDate;
var toDate;
var calDays;
var flag = false;
var index = null;
var assignee;

search(
  {
    serverRoot: 'https://jira.hmhco.com', // the base URL for the JIRA server
    user: 'pantn', // the user name
    pass: 'Neeraj@123', // the password
    jql: 'project = "CSI" AND status was "Inputs Required" AND assignee was in (aswalr) and createdDate >= "2019-3-05" AND createdDate< "2019-3-31"', // the JQL
    fields: '*all', // the fields parameter for the JIRA search
    expand: 'changelog', // the expand parameter for the JIRA search
    maxResults: 10, // the maximum number of results for each request to JIRA, multiple requests will be made till all the matching issues have been collected
    onTotal: function (total) {
      // optionally initialise a progress bar or something
    },
    mapCallback: function (issue) {

      console.log(issue.key);
      var historyData = issue.changelog.histories;
      for (let i = 0; i < historyData.length; i++) {
        let date = historyData[i].created;
        let items = historyData[i].items;
        index = null;
        for (let j = 0; j < items.length; j++) {
          let statusField = items[j].field;
          let fieldType = items[j].fieldtype;
          if (fieldType == "jira") {
            if (statusField == "status") {
              let fromStatus = items[j].fromString;
              let toStatus = items[j].toString;
              if (fromStatus == "Investigation & Research" && toStatus == "Inputs Required") {
                debugger
                index = j;
                let moveDate = date.split("T");
                let formatDate = new Date(moveDate[0]);
                fromDate = formatDate.getFullYear() + "-" + (formatDate.getMonth() + 1) + '-' + formatDate.getDate();
                console.log("from - " + fromDate);
                calculateDays(fromDate, null);
              }
              if (fromStatus == "Inputs Required" && toStatus == "Investigation & Research") {
                debugger
                index = j;
                let returnDate = date.split("T");
                let formatDate = new Date(returnDate[0]);
                toDate = formatDate.getFullYear() + "-" + (formatDate.getMonth() + 1) + '-' + formatDate.getDate();
                console.log("to - " + toDate);
                calculateDays(null, toDate);
              }
            }
            if (index != null && statusField == "assignee") {
              assignee = items[index + 1].toString;
              console.log(assignee);
            }
          }

        }

      }
      function calculateDays(fromDate, toDate) {
        if (toDate || fromDate) {
          if (fromDate && toDate) {
            var startDate = Date.parse(toDate);
            var endDate = Date.parse(fromDate);
            var timeDiff = startDate - endDate;
            daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            console.log("Difference days - " + daysDiff);

          } else if (toDate) {
            var today = new Date();
            var currentDate = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
            var startDate = Date.parse(currentDate);
            var endDate = Date.parse(toDate);
            var timeDiff = startDate - endDate;
            daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            console.log("Difference days - " + daysDiff);
          } else {
            var today = new Date();
            var currentDate = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
            var startDate = Date.parse(currentDate);
            var endDate = Date.parse(fromDate);
            var timeDiff = startDate - endDate;
            daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            console.log("Difference days - " + daysDiff);
          }

        }
      }

      return issue.key;
    }
  }).then(function (issues) {
    // consume the collected issues array here

  }).done();
