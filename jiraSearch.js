var search = require('jira-search');
var fromDate, assignee, historyData, toDate, calDays;
var flag = false;
var index, historyDataIndex, historyDataLIndex, sIndex, eIndex = null;
var ignoreUser = ["Paras Anand", "Ritesh Aswal", "Neeraj Pant", "Rohit Kanwar", "Prashant Gupta", "Neeharika Mittal", "Dheeraj Kumar"];

search(
  {
    serverRoot: 'https://jira.hmhco.com', // the base URL for the JIRA server
    user: 'pantn', // the user name
    pass: 'Neeraj@123', // the password
    jql: 'project = "CSI" AND status was "Inputs Required" AND assignee was in (aswalr) and createdDate >= "2019-3-27" AND createdDate< "2019-3-31"', // the JQL
    fields: '*all', // the fields parameter for the JIRA search
    expand: 'changelog', // the expand parameter for the JIRA search
    maxResults: 10, // the maximum number of results for each request to JIRA, multiple requests will be made till all the matching issues have been collected
    onTotal: function (total) {
      // optionally initialise a progress bar or something
    },
    mapCallback: function (issue) {

      console.log(issue.key);
      historyData = issue.changelog.histories;
      for (let i = 0; i < historyData.length; i++) {
        let date = historyData[i].created;
        let items = historyData[i].items;
        index = null;
        sIndex = null;
        eIndex = null;
        for (let j = 0; j < items.length; j++) {
          let statusField = items[j].field;
          let fieldType = items[j].fieldtype;
          if (fieldType == "jira") {
            if (statusField == "status") {
              let fromStatus = items[j].fromString;
              let toStatus = items[j].toString;
              if (fromStatus == "Investigation & Research" && toStatus == "Inputs Required") {
                index = j;
                sIndex = j;
                let moveDate = date.split("T");
                let formatDate = new Date(moveDate[0]);
                fromDate = formatDate.getFullYear() + "-" + (formatDate.getMonth() + 1) + '-' + formatDate.getDate();
                let printDate = formatDate.getDate() + "/" + (formatDate.getMonth() + 1) + "/" + formatDate.getFullYear();
                console.log("Move input date - " + printDate);
                var totalDays = calculateDays(fromDate, null);
              }
              if (fromStatus == "Inputs Required" && toStatus == "Investigation & Research") {
                // index = j;
                eIndex = j;
                let returnDate = date.split("T");
                let formatDate = new Date(returnDate[0]);
                toDate = formatDate.getFullYear() + "-" + (formatDate.getMonth() + 1) + '-' + formatDate.getDate();
                let printDate = formatDate.getDate() + "/" + (formatDate.getMonth() + 1) + "/" + formatDate.getFullYear();
                console.log("return to NIIT Date - " + printDate);
                calculateDays(null, toDate);
              }
            }
            if (index != null && statusField == "assignee") {
              assignee = items[index + 1].toString;
              console.log("IR assignee name - " + assignee);
              // console.log("days uner IR - " + totalDays);
            }
          }
        }

        if (sIndex) {
          historyDataIndex = i;
          otherAssignee(historyDataIndex, null);
        }
        if (eIndex) {
          historyDataLIndex = i;
          otherAssignee(null, historyDataLIndex);
        }

      }

      function otherAssignee(fieldTypeSIndex, fieldTypeEIndex) {
        // console.log("s" + fieldTypeSIndex + "e" + fieldTypeEIndex);
        if (fieldTypeSIndex && fieldTypeEIndex) {
          for (let i = fieldTypeSIndex + 1; i < fieldTypeEIndex; i++) {
            let date = historyData[i].created;
            let items = historyData[i].items;
            for (let j = 0; j < items.length; j++) {
              let statusField = items[j].field;
              let fieldType = items[j].fieldtype;
              if (fieldType == "jira") {
                if (statusField == "assignee") {
                  assignee = items[j].toString;
                  console.log("Next assignee - " + assignee);
                  let moveDate = date.split("T");
                  let formatDate = new Date(moveDate[0]);
                  fromDate = formatDate.getFullYear() + "-" + (formatDate.getMonth() + 1) + '-' + formatDate.getDate();
                  console.log("Next assignee date - " + fromDate);
                }
              }
            }
          }
        }
        if (fieldTypeSIndex) {
          let i = fieldTypeSIndex + 1;
          for (let i = fieldTypeSIndex + 1; i < historyData.length; i++) {
            let date = historyData[i].created;
            let items = historyData[i].items;
            for (let j = 0; j < items.length; j++) {
              let statusField = items[j].field;
              let fieldType = items[j].fieldtype;
              if (fieldType == "jira") {
                if (statusField == "assignee") {
                  assignee = items[j].toString;
                  var checkAsssignee = ignoreUser.includes(assignee);
                  if (checkAsssignee == false) {
                    console.log("Next assignee -" + assignee);
                    let moveDate = date.split("T");
                    let formatDate = new Date(moveDate[0]);
                    fromDate = formatDate.getFullYear() + "-" + (formatDate.getMonth() + 1) + '-' + formatDate.getDate();
                    console.log("Next assignee date -" + fromDate);
                  }
                  else {
                    continue;
                  }
                }
              }
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
            return daysDiff;
            // console.log("Difference days - " + daysDiff);

          } else if (toDate) {
            var today = new Date();
            var currentDate = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
            var startDate = Date.parse(currentDate);
            var endDate = Date.parse(toDate);
            var timeDiff = startDate - endDate;
            daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            return daysDiff;
            // console.log("Difference days - " + daysDiff);
          } else {
            var today = new Date();
            var currentDate = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
            var startDate = Date.parse(currentDate);
            var endDate = Date.parse(fromDate);
            var timeDiff = startDate - endDate;
            daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            return daysDiff;
            // console.log("Difference days - " + daysDiff);
          }

        }
      }

      return issue.key;
    }
  }).then(function (issues) {
    // consume the collected issues array here

  }).done();
