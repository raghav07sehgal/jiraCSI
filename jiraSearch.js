var search = require('jira-search');
var localStorage = require('localStorage');
var fromDate, assignee, historyData, toDate, totalDays, IRformatTime, IPformatTime, OAformatTime, fromTime, toTime, nextAsTime;
var flag = false;
var index, historyDataIndex, historyDataLIndex,
var sIndex = null;
var eIndex = null;
var ignoreUser = ["Paras Anand", "Ritesh Aswal", "Neeraj Pant", "Rohit Kanwar", "Tier 2 - Lead", "Prashant Gupta", "Neeharika Mittal", "Dheeraj Kumar"];
var irDate = [];
var ipDate = [];
var otAssDate = [];

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

      console.log(issue.key + "\n");
      historyData = issue.changelog.histories;
      irDate = [];
      ipDate = [];
      otAssDate = [];
      fromTime = "", toTime = "", nextAsTime = "";
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
              //status moved to input required
              if (fromStatus == "Investigation & Research" && toStatus == "Inputs Required") {
                index = j;
                sIndex = j;
                let moveDate = date.split("T");
                let formatDate = new Date(moveDate[0]);
                fromDate = formatDate.getFullYear() + "-" + (formatDate.getMonth() + 1) + '-' + formatDate.getDate();
                let printDate = formatDate.getDate() + "/" + (formatDate.getMonth() + 1) + "/" + formatDate.getFullYear();
                irDate.push(fromDate);
                console.log("Move input date - " + printDate);
                let time = moveDate[1];
                IRformatTime = date.split(".");
                calculateDays(irDate, ipDate, otAssDate, IRformatTime, IPformatTime, OAformatTime);
                // calculateTime(IRformatTime, IPformatTime, OAformatTime);

              }
              //status returned from input required
              if (fromStatus == "Inputs Required" && toStatus == "Investigation & Research") {
                eIndex = j;
                let returnDate = date.split("T");
                let formatDate = new Date(returnDate[0]);
                toDate = formatDate.getFullYear() + "-" + (formatDate.getMonth() + 1) + '-' + formatDate.getDate();
                let printDate = formatDate.getDate() + "/" + (formatDate.getMonth() + 1) + "/" + formatDate.getFullYear();
                ipDate.push(toDate);
                console.log("Return to NIIT Date - " + printDate);
                let time = moveDate[1];
                IPformatTime = date.split(".");
                calculateDays(irDate, ipDate, otAssDate, IRformatTime, IPformatTime, OAformatTime);
                // calculateTime(IRformatTime, IPformatTime, OAformatTime);
                irDate = [];
                ipDate = [];
                otAssDate = [];
              }
            }
            if (index != null && statusField == "assignee") {
              assignee = items[index + 1].toString;
              console.log("IR assignee name - " + assignee + "\n");
            }

          }
        }
        if (sIndex) {
          historyDataIndex = i;
          localStorage.setItem("stIndex", historyDataIndex);

          otherAssignee(historyDataIndex, null);
        }
        if (eIndex) {
          historyDataLIndex = i;
          var stIndex = localStorage.getItem("stIndex");
          stIndex = parseInt(stIndex);
          otherAssignee(stIndex, historyDataLIndex);
        }
      }

      function otherAssignee(fieldTypeSIndex, fieldTypeEIndex) {
        localStorage.removeItem("stIndex");
        if (fieldTypeSIndex && !fieldTypeEIndex) {
          for (let i = fieldTypeSIndex + 1; i < historyData.length; i++) {
            let date = historyData[i].created;
            debugger
            let items = historyData[i].items;
            for (let j = 0; j < items.length; j++) {
              let statusField = items[j].field;
              let fieldType = items[j].fieldtype;
              if (fieldType == "jira") {
                if (statusField == "assignee") {
                  assignee = items[j].toString;
                  var checkAsssignee = ignoreUser.includes(assignee);
                  if (checkAsssignee == false) {
                    let moveDate = date.split("T");
                    let formatDate = new Date(moveDate[0]);
                    fromDate = formatDate.getFullYear() + "-" + (formatDate.getMonth() + 1) + '-' + formatDate.getDate();
                    let printDate = formatDate.getDate() + "/" + (formatDate.getMonth() + 1) + "/" + formatDate.getFullYear();
                    console.log("Next assignee date - " + printDate);
                    console.log("Next assignee - " + assignee + "\n");
                    otAssDate.push(fromDate);
                    let time = moveDate[1];
                    OAformatTime = date.split(".");
                    // calculateTime(IRformatTime, IPformatTime, OAformatTime);
                    calculateDays(irDate, ipDate, otAssDate, IRformatTime, IPformatTime, OAformatTime);

                  }
                  else {
                    continue;
                  }
                } else if (statusField == "status") {
                  break;
                }
              }
            }
          }
        } else {
          console.log("Now Ticket under NIIT account");
        }
      }

      function calculateDays(fromDate, toDate, nextAsDate, fromTime, toTime, nextAsTime) {
        debugger
        //Till next assignee day
        if ((fromDate.length != 0) && (nextAsDate.length != 0) && (toDate.length == 0)) {
          for (let i = 0; i < fromDate.length; i++) {
            if (fromDate[i] == nextAsDate[i]) {
              let startTime
              let endTime
            } else {
              var startDate = Date.parse(fromDate[i]);
              var endDate = Date.parse(nextAsDate[i]);
              var timeDiff = startDate - endDate;
              daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
              console.log("Assignee difference days - " + daysDiff);
            }
          }
        }
        //Till return to NIIT days
        if ((fromDate.length != 0) && (toDate.length != 0)) {
          if ((nextAsDate.length >= 0)) {
            for (let i = 0; i < fromDate.length; i++) {
              var startDate = Date.parse(toDate[i]);
              var endDate = Date.parse(fromDate[i]);
              var timeDiff = startDate - endDate;
              daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
              console.log("Total Input days - " + daysDiff);
            }
          }
        }
        //still under input required days
        if ((fromDate.length != 0) && (toDate.length == 0)) {
          if ((nextAsDate.length >= 0)) {
            for (let i = 0; i < fromDate.length; i++) {
              var today = new Date();
              var currentDate = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
              var startDate = Date.parse(currentDate);
              var endDate = Date.parse(fromDate[i]);
              var timeDiff = startDate - endDate;
              daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
              console.log("Till Total Input days - " + daysDiff);
            }
          }
        }
      }

      return issue.key;
    }
  }).then(function (issues) {
    // consume the collected issues array here

  }).done();
