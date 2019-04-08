var search = require('jira-search');
var localStorage = require('localStorage');
var fromDate, otherDate, assignee, historyData, toDate, totalDays, IRformatTime, IPformatTime, OAformatTime, fromTime, toTime, nextAsTime;
var flag = false;
var index, historyDataIndex, historyDataLIndex, ticketStatus;
var sIndex = null;
var eIndex = null;
var ignoreUser = ["Paras Anand", "Ritesh Aswal", "Neeraj Pant", "Karishma Jain", "HMH Release Management", "T3 QA Lead", "Release Engineering NIIT", "Prashant Dubey", "Amrita Padavil", "Rohit Kanwar", "Tier 2 - Lead", "Prashant Gupta", "Neeharika Mittal", "Dheeraj Kumar"];
var irDate = [];
var ipDate = [];
var otAssDate = [];
var OAformatTime = [];
var dayFlag = false;
var aSFlag = false;

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

      if (issue) {
        console.log("\n" + issue.key);
        ticketStatus = issue.fields.status.name;
        console.log("Current Ticket Status - " + ticketStatus + "\n");

        historyData = issue.changelog.histories;
        irDate = [];
        ipDate = [];
        otAssDate = [];
        OAformatTime = [];
        fromTime = "", toTime = "", nextAsTime = [];
        for (let i = 0; i < historyData.length; i++) {
          let date = historyData[i].created;
          let items = historyData[i].items;
          index = null;
          sIndex = null;
          eIndex = null;
          // dayFlag = true;
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
                  let formatTime = time.split(".");
                  IRformatTime = formatTime[0];
                  calculateDays(irDate, ipDate, otAssDate, IRformatTime, IPformatTime, OAformatTime);

                }
                //status returned from input required
                if (fromStatus == "Inputs Required" && toStatus == "Investigation & Research") {
                  eIndex = j;
                  let returnDate = date.split("T");
                  let formatDate = new Date(returnDate[0]);
                  toDate = formatDate.getFullYear() + "-" + (formatDate.getMonth() + 1) + '-' + formatDate.getDate();
                  let printDate = formatDate.getDate() + "/" + (formatDate.getMonth() + 1) + "/" + formatDate.getFullYear();
                  ipDate.push(toDate);
                  console.log("Return to NIIT Date - " + printDate + "\n");

                  let time = returnDate[1];
                  let formatTime = time.split(".");
                  IPformatTime = formatTime[0];
                  calculateDays(irDate, ipDate, otAssDate, IRformatTime, IPformatTime, OAformatTime);
                  irDate = [];
                  ipDate = [];
                  otAssDate = [];
                }
              }
              if (index != null && statusField == "assignee") {
                assignee = items[index + 1].toString;
                console.log("IR assignee name - " + assignee);
              }

            }
          }
          if (sIndex && !eIndex) {
            historyDataIndex = i;
            localStorage.setItem("stIndex", historyDataIndex);
            otherAssignee(historyDataIndex, null);
          }
          if (eIndex) {
            historyDataLIndex = i;
            var stIndex = localStorage.getItem("stIndex");
            stIndex = parseInt(stIndex);
            debugger
            otherAssignee(stIndex, historyDataLIndex);
          }
         
        }

        function otherAssignee(fieldTypeSIndex, fieldTypeEIndex) {
          // localStorage.removeItem("stIndex");
          debugger
          if (fieldTypeSIndex && !fieldTypeEIndex) {
            for (let i = fieldTypeSIndex + 1; i < historyData.length; i++) {
              let date = historyData[i].created;
              let items = historyData[i].items;
              for (let j = 0; j < items.length; j++) {
                let statusField = items[j].field;
                let fieldType = items[j].fieldtype;
                if (fieldType == "jira") {
                  if (statusField == "assignee") {
                    assignee = items[j].toString;
                    // var checkAsssignee = ignoreUser.includes(assignee);
                    var checkAsssignee = ignoreUser.indexOf(assignee);
                    if (checkAsssignee == -1) {
                      debugger
                      let moveDate = date.split("T");
                      let formatDate = new Date(moveDate[0]);
                      otherDate = formatDate.getFullYear() + "-" + (formatDate.getMonth() + 1) + '-' + formatDate.getDate();
                      // if (otherDate <= toDate) {
                      debugger
                      let printDate = formatDate.getDate() + "/" + (formatDate.getMonth() + 1) + "/" + formatDate.getFullYear();
                      console.log("Next assignee date - " + printDate);
                      console.log("Next assignee - " + assignee + "\n");
                      otAssDate.push(otherDate);
                      let time = moveDate[1];
                      let formatTime = time.split(".");
                      OAformatTime.push(formatTime[0]);
                      calculateDays(irDate, ipDate, otAssDate, IRformatTime, IPformatTime, OAformatTime);
                      // } else {
                      //   return;
                      // }
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
            console.log("Now Ticket under NIIT account\n");
            dayFlag = false;
          }
        }

        function calculateDays(fromDate, toDate, nextAsDate, fromTime, toTime, nextAsTime) {
          //Till next assignee day
          if ((fromDate.length != 0) && (nextAsDate.length != 0) && (toDate.length == 0)) {
            dayFlag = true;
            //difference days between two assignees
            if (nextAsDate.length > 1) {
              var fstAsDate = nextAsDate[0];
              for (let i = 1; i < nextAsDate.length; i++) {
                if (fstAsDate == nextAsDate[i]) {
                  let splitDate1 = fstAsDate.split('-');
                  let splitDate2 = nextAsDate[i].split('-');
                  var time_start = new Date(splitDate1[0], splitDate1[1], splitDate1[2]);
                  var time_end = new Date(splitDate2[0], splitDate2[1], splitDate2[2]);
                  var value_start = nextAsTime[i].split(':');
                  var value_end = nextAsTime[0].split(':');
                  time_start.setHours(value_start[0], value_start[1], value_start[2], 0)
                  time_end.setHours(value_end[0], value_end[1], value_end[2], 0)
                  var timeInMs = time_start - time_end;
                  var time = msToTime(timeInMs);
                  console.log("Assignee between other assignee difference in time - " + time + "\n");
                } else {
                  var startDate = Date.parse(fstAsDate);
                  var endDate = Date.parse(nextAsDate[i]);
                  var timeDiff = endDate - startDate;
                  daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                  console.log("Assignee between other assignee difference days - " + daysDiff + "\n");
                }
              }
            } else {
              for (let i = 0; i < fromDate.length; i++) {
                if (fromDate[i] == nextAsDate[i]) {
                  let splitDate1 = nextAsDate[i].split('-');
                  let splitDate2 = fromDate[i].split('-');
                  var time_start = new Date(splitDate1[0], splitDate1[1], splitDate1[2]);
                  var time_end = new Date(splitDate2[0], splitDate2[1], splitDate2[2]);
                  var value_start = nextAsTime[i].split(':');
                  var value_end = fromTime.split(':');
                  time_start.setHours(value_start[0], value_start[1], value_start[2], 0)
                  time_end.setHours(value_end[0], value_end[1], value_end[2], 0)
                  var timeInMs = time_start - time_end;
                  var time = msToTime(timeInMs);
                  console.log("Assignee difference in time - " + time + "\n");
                } else {
                  var startDate = Date.parse(nextAsDate[i]);
                  var endDate = Date.parse(fromDate[i]);
                  var timeDiff = startDate - endDate;
                  daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                  console.log("Assignee difference days - " + daysDiff + "\n");
                }
              }
            }
          }
          //Till return to NIIT days
          if ((fromDate.length != 0) && (toDate.length != 0)) {
            if ((nextAsDate.length >= 0)) {
              dayFlag = true;
              for (let i = 0; i < fromDate.length; i++) {
                if (fromDate[i] == toDate[i]) {
                  let splitDate1 = toDate[i].split('-');
                  let splitDate2 = fromDate[i].split('-');
                  var time_start = new Date(splitDate2[0], splitDate2[1], splitDate2[2]);
                  var time_end = new Date(splitDate1[0], splitDate1[1], splitDate1[2]);
                  var value_start = toTime.split(':');
                  var value_end = fromTime.split(':');
                  time_start.setHours(value_start[0], value_start[1], value_start[2], 0)
                  time_end.setHours(value_end[0], value_end[1], value_end[2], 0)
                  var timeInMs = time_start - time_end;
                  var time = msToTime(timeInMs);
                  console.log("Total Input in time - " + time);
                } else {
                  var startDate = Date.parse(toDate[i]);
                  var endDate = Date.parse(fromDate[i]);
                  var timeDiff = startDate - endDate;
                  daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                  console.log("Total Input days - " + daysDiff);
                }
              }
            }
          }
          //still under input required days
          if ((fromDate.length != 0) && (toDate.length == 0) && dayFlag == false) {
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
            // if ((nextAsDate.length == 0)) {
            //   return;
            // }
          }

        }

        function msToTime(duration) {
          var milliseconds = parseInt((duration % 1000) / 100),
            seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

          hours = (hours < 10) ? "0" + hours : hours;
          minutes = (minutes < 10) ? "0" + minutes : minutes;
          seconds = (seconds < 10) ? "0" + seconds : seconds;

          return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
        }
      } else {
        console.log("Wrong JQL");
      }

      return issue.key;
    }
  }).then(function (issues) {
    // consume the collected issues array here
  }).done();


