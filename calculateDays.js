var searchApi = require('./jiraSearch.js');
var localStorage = require('localStorage');
var issue, fromDate, otherDate, assignee, historyData, toDate, totalDays, IRformatTime, IPformatTime, OAformatTime, fromTime, toTime, nextAsTime;
var flag = false;
var index, historyDataIndex, historyDataLIndex, ticketStatus, Resulttime, oResulttime, daysDiff, TdaysDiff, SdaysDiff, oDaysDiff, row1, row2, dataRow1, dataRow2;
var sIndex = null;
var eIndex = null;
var ignoreUser = ["Paras Anand", "Ritesh Aswal", "Neeraj Pant", "Karishma Jain", "HMH Release Management", "T3 QA Lead", "Release Engineering NIIT", "Prashant Dubey", "Amrita Padavil", "Rohit Kanwar", "Tier 2 - Lead", "Prashant Gupta", "Neeharika Mittal", "Dheeraj Kumar"];
var irDate = [];
var ipDate = [];
var otAssDate = [];
var OAformatTime = [];
var dayFlag = false;
var aSFlag = false;
var returnFlag = false;
var otFlag = false;
var ipData = false;
var filePath = "D:/raghavData/PROJECTS/project SM/Server/Report.xlsx";
// var filePath = "R:/my files/niit/jiraApi/jiraCSI/Report.xlsx";
var Excel = require('exceljs');// load exceljs module
var workbook = new Excel.Workbook(); //create object of workbook
var newSheet = workbook.addWorksheet('TestData');//add sheet to workbook
var rowData = [];
var rowData1 = [];
var rowData2 = [];
var rowData3 = [];
var rowData4 = [];
var rowData5 = [];
var rowiPData1 = [];
var rowiRData1 = [];
var rowAllData = [];
var iRData = [];
var iPrData = [];
var othAssData = [];
var daysData = [];
var otherAsDataAdd = [];
var ipDataAdd = [];
var allDataAdd = [];
assignee = "";
var allDataFlag = false;
var allData = [];
var otherAsgntFlag = false;

addRowToNewExcel();
function addRowToNewExcel() {
	rowData[1] = 'CSI Ticket'; //where 1 is first column   i.e. A
	rowData[2] = 'Start Date';
	rowData[3] = 'End Date';
	rowData[4] = 'Assignee';
	rowData[5] = 'Days';
	//use addRow to write row on created sheet
	newSheet.addRow(rowData);
}

exports.setData = function (data) {
	issue = data;
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
						// iRData.push({ csi: issue.key, toName: assignee, fromDate: fromDate, daysDiff: daysDiff, tillTotalDays: SdaysDiff });
					}
					//status returned from input required
					if (fromStatus == "Inputs Required" && toStatus == "Investigation & Research") {
						eIndex = j;
						let returnDate = date.split("T");
						let formatDate = new Date(returnDate[0]);
						toDate = formatDate.getFullYear() + "-" + (formatDate.getMonth() + 1) + '-' + formatDate.getDate();
						returnFlag = true;
						let printDate = formatDate.getDate() + "/" + (formatDate.getMonth() + 1) + "/" + formatDate.getFullYear();
						ipDate.push(toDate);
						console.log("Return to NIIT Date - " + printDate + "\n");
						let time = returnDate[1];
						let formatTime = time.split(".");
						IPformatTime = formatTime[0];
						calculateDays(irDate, ipDate, otAssDate, IRformatTime, IPformatTime, OAformatTime);
						iPrData.push({ csi: issue.key, toName: assignee, toDate: toDate, AssdaysDiff: daysDiff, totalDays: TdaysDiff, tillTotalDays: SdaysDiff });
						irDate = [];
						ipDate = [];
						otAssDate = [];
					}
				}
				if (statusField == "assignee") {
					//By whom assignee back to I&R state
					// if (returnFlag && eIndex != null) {
					// 	assignee = items[eIndex + 1].fromString;
					// 	console.log("IR assignee name - " + assignee);
					// 	if (toDate) {
					// 		iPrData.push({ csi: issue.key, toName: assignee, toDate: toDate, AssdaysDiff: daysDiff, totalDays: TdaysDiff, tillTotalDays: SdaysDiff });
					// 	}
					// }
					if (index != null) {
						assignee = items[index + 1].toString;
						console.log("IR assignee name - " + assignee);
						if (fromDate) {
							iRData.push({ csi: issue.key, toName: assignee, fromDate: fromDate, daysDiff: daysDiff, tillTotalDays: SdaysDiff });
							assignee = "";
							if (iRData.length > 1) {
								for (let k = 0; k < iRData.length; k++) {
									if ((iRData.length) != (k + 1)) {
										if (iRData[k].fromDate == iRData[k + 1].fromDate) {
											if (iRData[k].toName == "") {
												iRData.splice(k, 1);
											}
										}
									}
								}
							}
						}
					}
				} else {
					if (index != null && fromDate) {
						iRData.push({ csi: issue.key, toName: assignee, fromDate: fromDate, daysDiff: daysDiff, tillTotalDays: SdaysDiff });
					}
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
			otherAssignee(stIndex, historyDataLIndex);
		}
	}


	function otherAssignee(fieldTypeSIndex, fieldTypeEIndex) {
		if (fieldTypeSIndex && !fieldTypeEIndex) {
			for (let i = fieldTypeSIndex + 1; i < historyData.length; i++) {
				let date = historyData[i].created;
				let items = historyData[i].items;
				for (let j = 0; j < items.length; j++) {
					let statusField = items[j].field;
					let fieldType = items[j].fieldtype;
					if (fieldType == "jira") {
						if (statusField == "assignee") {
							checkAsssignee = items[j].toString;
							// var checkAsssignee = ignoreUser.includes(assignee);
							var assignee = ignoreUser.indexOf(checkAsssignee);
							if (assignee == -1) {
								let moveDate = date.split("T");
								let formatDate = new Date(moveDate[0]);
								otherDate = formatDate.getFullYear() + "-" + (formatDate.getMonth() + 1) + '-' + formatDate.getDate();
								let printDate = formatDate.getDate() + "/" + (formatDate.getMonth() + 1) + "/" + formatDate.getFullYear();
								console.log("Next assignee date - " + printDate);
								console.log("Next assignee - " + checkAsssignee + "\n");
								otAssDate.push(otherDate);
								let time = moveDate[1];
								let formatTime = time.split(".");
								OAformatTime.push(formatTime[0]);
								calculateDays(irDate, ipDate, otAssDate, IRformatTime, IPformatTime, OAformatTime);
								if (otherDate) {
									othAssData.push({ csi: issue.key, otherName: checkAsssignee, otherDate: otherDate, daysDiff: daysDiff });
								}
							}
							else {
								continue;
							}
						} else if (statusField == "status") {
							let fromStatus = items[j].fromString;
							let toStatus = items[j].toString;
							if (fromStatus == "Inputs Required" && toStatus == "Investigation & Research") {
								// break;
								return;
							}
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
					var startDate = Date.parse(fstAsDate);
					var endDate = Date.parse(nextAsDate[i]);
					var timeDiff = endDate - startDate;
					daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
					console.log("Assignee between other assignee difference days - " + daysDiff + "\n");
					nextAsDate.shift();
				}
			} else {
				for (let i = 0; i < fromDate.length; i++) {
					var startDate = Date.parse(nextAsDate[i]);
					var endDate = Date.parse(fromDate[i]);
					var timeDiff = startDate - endDate;
					daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
					console.log("Assignee difference days - " + daysDiff + "\n");
				}
			}
		}
		//Till return to NIIT days
		if ((fromDate.length != 0) && (toDate.length != 0)) {
			if ((nextAsDate.length >= 0)) {
				dayFlag = true;
				for (let i = 0; i < fromDate.length; i++) {
					var startDate = Date.parse(toDate[i]);
					var endDate = Date.parse(fromDate[i]);
					var timeDiff = startDate - endDate;
					TdaysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
					console.log("Total Input days - " + TdaysDiff);
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
					SdaysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
					console.log("Till Total Input days - " + SdaysDiff);
				}
			}
		}
	}

	writeExcel();
	var checkFunction = createExcel(filePath);
	if (checkFunction == "flagExcel") {
		iRData = [];
		iPrData = [];
		othAssData = [];
	}

}

function createExcel(excelFilePath) {
	workbook.xlsx.writeFile(excelFilePath)
		.then(function () {
			console.log("excel file created successfully");
		});
	return "flagExcel";
}

function writeExcel() {
	ipData = false;
	otFlag = false;
	allDataFlag = false;
	ipDataAdd = [];
	otherAsDataAdd = [];
	allData = [];
	allDataAdd = [];

	if (iRData.length > 0 && othAssData.length > 0 && iPrData.length > 0) {
		allDataFlag = true;
		for (let i = 0; i < iRData.length; i++) {
			allData.push({ title: "input required", sort: "1", csi: iRData[i].csi, date: iRData[i].fromDate, name: iRData[i].toName, days: iRData[i].daysDiff, totalDays: iRData[i].tillTotalDays });
		}

		for (let j = 0; j < othAssData.length; j++) {
			allData.push({ title: "Other assigneee", sort: "2", csi: othAssData[j].csi, date: othAssData[j].otherDate, name: othAssData[j].otherName, days: othAssData[j].daysDiff });
		}

		for (let k = 0; k < iPrData.length; k++) {
			allData.push({ title: "input provided", sort: "3", csi: iPrData[k].csi, date: iPrData[k].toDate, name: iPrData[k].toName, days: iPrData[k].daysDiff, totalDays: iPrData[k].tillTotalDays });
		}

		for (let i = 0; i < allData.length; i++) {
			var allDaLen = allData.length;
			allData.sort((a, b) => (a.sort > b.sort) ? 1 : -1)
			allData.sort(function (a, b) {
				var dateA = new Date(a.date), dateB = new Date(b.date)
				return dateA - dateB //sort by date ascending
			})

			if (allData.length != i + 1) {

				if ((allData[i].title == "input required") && (allData[i + 1].title == "input required")) {
					allData.sort(function (a, b) {
						var t1 = "input required";
						var t2 = "Other assigneee";
						var t3 = "input provided";
						var title1 = a.title, title2 = b.title;
						if (title1 == t1 && title2 == t1) {
							return -1;
						}
						if (title1 == t3 && title2 == t3) {
							return 1;
						}
						return 0;
					})
				}
			}
			if (allData[i].title == "input provided" && allData[i].title == "Other assigneee") {
				continue;
			}

			if ((i + 1) == allDaLen) {
				if (allData[allDaLen - 1].title == "Other assigneee" || allData[allDaLen - 1].title == "input required") {

					rowAllData[1] = allData[i].csi;
					rowAllData[2] = allData[i].date;
					rowAllData[3] = "";
					rowAllData[4] = allData[i].name;
					var today = new Date();
					var currentDate = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
					var startDate = Date.parse(currentDate);
					var endDate = Date.parse(allData[i].date);
					var timeDiff = startDate - endDate;
					var currentDaysdiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
					rowAllData[5] = currentDaysdiff;
				}
			}

			if (allData[i].title == "input provided") {
				continue;
			} else {
				if (allData.length != i + 1) {
					rowAllData[1] = allData[i].csi;
					rowAllData[2] = allData[i].date;
					rowAllData[3] = allData[i + 1].date;
					var name = allData[i].name;
					rowAllData[4] = name;
					if (allData[i].title == "input required" && allData[i + 1].title == "Other assigneee") {
						rowAllData[5] = allData[i + 1].days;
					} else if (allData[i].title == "Other assigneee" && allData[i + 1].title == "input provided") {
						var startDT = allData[i + 1].date;
						var endDT = allData[i].date;
						var startDate = Date.parse(startDT);
						var endDate = Date.parse(endDT);
						var timeDiff = startDate - endDate;
						var daysDiffOt = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
						rowAllData[5] = daysDiffOt;
					} else {
						var startDT = allData[i + 1].date;
						var endDT = allData[i].date;
						var startDate = Date.parse(startDT);
						var endDate = Date.parse(endDT);
						var timeDiff = startDate - endDate;
						var daysDiffOt = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
						rowAllData[5] = daysDiffOt;
					}
				}
			}
			newSheet.addRow(rowAllData);
			allDataAdd.push({ csi: rowAllData[1], days: rowAllData[5] });
		}
	}
	if (allDataFlag == false) {
		for (let i = 0; i < iRData.length; i++) {

			if (iRData.length > 0 && othAssData.length > 0) {
				for (let k = 0; k < othAssData.length; k++) {
					if (iRData[i].csi == othAssData[k].csi) {
						if (otFlag == false) {
							rowData1[1] = iRData[i].csi;
							rowData1[4] = iRData[i].toName;
							let fstDate = iRData[i].fromDate;
							let scndDate = othAssData[k].otherDate;
							// assign later after input required
							if (fstDate > scndDate) {
								rowData1[2] = "";
								rowData1[3] = othAssData[k].otherDate;
								rowData1[6] = "Assignee was not assigned on same day.";
							} else {
								rowData1[2] = iRData[i].fromDate;
								rowData1[3] = othAssData[k].otherDate;
							}
							rowData1[5] = othAssData[k].daysDiff;
							otFlag = true;
							newSheet.addRow(rowData1);
						}

						if (othAssData.length > 1) {
							let otLen = othAssData.length;
							otherAsgntFlag = true;
							rowData5[1] = othAssData[k].csi;
							rowData5[2] = othAssData[k].otherDate;
							if (otLen != (k + 1)) {
								rowData5[3] = othAssData[k + 1].otherDate;
								rowData5[4] = othAssData[k].otherName;
								rowData5[5] = othAssData[k + 1].daysDiff;
							} else {
								rowData5[3] = "";
								rowData5[4] = othAssData[k].otherName;
								let fst = othAssData[k].otherDate;
								var today = new Date();
								var currentDate = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
								var startDate = Date.parse(currentDate);
								var endDate = Date.parse(fst);
								var timeDiff = startDate - endDate;
								var otDaysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
								rowData5[5] = otDaysDiff;
							}
							otherAsDataAdd.push({ csi: rowData5[1], days: rowData5[5] });
							newSheet.addRow(rowData5);
						}
					}
				}
			} else if (iRData.length > 0 && iPrData.length > 0) {

				for (let j = i; j < iPrData.length; j++) {
					if (iRData[i].csi == iPrData[j].csi) {
						rowiPData1[1] = iRData[i].csi;
						rowiPData1[2] = iRData[i].fromDate;
						rowiPData1[4] = iRData[i].toName;
						rowiPData1[3] = iPrData[i].toDate;
						rowiPData1[5] = iPrData[i].totalDays;
						newSheet.addRow(rowiPData1);
						ipDataAdd.push({ csi: rowiPData1[1], days: rowiPData1[5] });
						ipData = true;
						break;
					}
				}
			} else {
				rowiRData1[1] = iRData[i].csi;
				rowiRData1[2] = iRData[i].fromDate;
				rowiRData1[4] = iRData[i].toName;
				rowiRData1[3] = "";
				rowiRData1[5] = iRData[i].tillTotalDays;
				newSheet.addRow(rowiRData1);
			}

			if (iPrData.length > 0) {
				for (let j = 0; j < iPrData.length; j++) {
					if (iRData[i].csi == iPrData[j].csi) {

						if (rowData2.length == 0 && ipData == false) {
							rowData2[1] = iPrData[j].csi;
							rowData2[3] = iPrData[j].toDate;
							if (othAssData.length > 0) {
								let otLen = othAssData.length;
								for (let k = 0; k < othAssData.length; k++) {
									rowData2[2] = othAssData[otLen - 1].otherDate;
									rowData2[4] = othAssData[k].otherName;
									let startDT = rowData2[3];
									let endDT = rowData2[2];
									var startDate = Date.parse(startDT);
									var endDate = Date.parse(endDT);
									var timeDiff = startDate - endDate;
									var daysDiffOt = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
									rowData2[5] = daysDiffOt;
									othAssData = [];
								}
							} else {
								rowData2[2] = iRData[i].fromDate;
								rowData2[3] = iPrData[j].toDate;
								rowData2[4] = iPrData[j].toName;
								rowData2[5] = iPrData[j].totalDays;
							}
							newSheet.addRow(rowData2);

						} else {
							break;
						}
					}
				}
			}
			if (othAssData.length > 0 && otherAsgntFlag == false) {
				for (let k = i; k < othAssData.length; k++) {
					if (othAssData.length == 1) {
						rowData3[1] = othAssData[k].csi;
						rowData3[2] = othAssData[i].otherDate;
						rowData3[3] = "";
						rowData3[4] = othAssData[k].otherName;
						let fst = othAssData[i].otherDate;
						var today = new Date();
						var currentDate = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
						var startDate = Date.parse(currentDate);
						var endDate = Date.parse(fst);
						var timeDiff = startDate - endDate;
						var otDaysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
						rowData3[5] = otDaysDiff;
						newSheet.addRow(rowData3);
					} else {
						if (iRData[i].csi == othAssData[k].csi) {
							rowData3[1] = othAssData[k].csi;
							rowData3[2] = iRData[i].fromDate;
							if (iPrData.length > 0) {
								for (let j = 0; j < iPrData.length; j++) {
									rowData3[3] = iPrData[j].toDate;
								}
							} else {
								rowData3[3] = "";
							}
							rowData3[4] = othAssData[k].otherName;
							if (iRData.length > 0) {
								rowData3[5] = iRData[i].tillTotalDays;
							} else {
								rowData3[5] = othAssData[k].daysDiff;
							}
							newSheet.addRow(rowData3);
						}
					}

				}
			}
		}
	}


	if (rowData1.length > 0 || rowData2.length > 0 || rowAllData.length > 0 || rowData3.length > 0 || rowiPData1.length > 0 || rowiRData1.length > 0) {
		totalData(rowData1, rowData2, rowData3);
	}
}
function totalData(rowData1, rowData2, rowData3) {
	var flag1 = false;
	var flag2 = false;
	var flag3 = false;
	rowData4[1] = issue.key;
	rowData4[2] = "";
	rowData4[3] = "";
	rowData4[4] = "Total";

	if (rowAllData.length > 0 && allDataAdd.length > 0) {
		let fstArraySum = 0;

		for (let i = 0; i < allDataAdd.length; i++) {
			fstArraySum += allDataAdd[i].days;
			rowData4[5] = fstArraySum;
		}
	}
	if (rowData1.length > 0 && rowData2.length > 0 && rowData3.length > 0 && flag2 == false && flag3 == false) {
		flag1 = true;

		if (rowiPData1.length > 0) {
			if (rowiPData1[1] == rowData1[1]) {
				if ((rowData1[1] == rowData2[1])) {
					let fst = rowData1[5];
					let scnd = rowiPData1[5];
					let third = rowData2[5];
					rowData4[5] = fst + scnd + third;
				}
				if ((rowData1[1] == rowData3[1])) {
					let fst = rowData1[5];
					let scnd = rowiPData1[5];
					let third = rowData3[5];
					rowData4[5] = fst + scnd + third;
				}
			} else {
				if (ipDataAdd.length > 1) {
					var iPsum = 0;
					for (let i = 0; i < ipDataAdd.length; i++) {
						iPsum += ipDataAdd[i].days;
						rowData4[5] = iPsum;
					}
				} else {
					rowData4[5] = rowiPData1[5];
				}

			}
		}
		if (rowiRData1.length > 0) {
			if (rowData1[1] == rowiRData1[1]) {
				if ((rowData1[1] == rowData2[1])) {
					let fst = rowData1[5];
					let scnd = rowiRData1[5];
					let third = rowData2[5];
					rowData4[5] = fst + scnd + third;
				}
				if ((rowData1[1] == rowData3[1])) {
					let fst = rowData1[5];
					let scnd = rowiRData1[5];
					let third = rowData3[5];
					rowData4[5] = fst + scnd + third;
				}
			} else {
				rowData4[5] = rowiRData1[5];

			}
			if (rowData1[1] == rowiRData1[1]) {
				let fst = rowData1[5];
				let scnd = rowData2[5];
				let third = rowData3[5];
				rowData4[5] = fst + scnd + third;

			}
		}
		if (rowData1[1] == rowData3[1]) {
			let fst = rowData1[5];
			let scnd = rowData3[5];
			rowData4[5] = fst + scnd;
		}
	}

	if (rowData1.length > 0 && rowData2.length > 0 && flag1 == false && flag3 == false) {

		flag2 = true;
		if (rowData1[1] == rowData2[1]) {
			let fst = rowData1[5];
			let scnd = rowData2[5];
			rowData4[5] = fst + scnd;
		}

		if (otherAsDataAdd.length > 0) {

			let fstArraySum = 0;
			for (let i = 0; i < otherAsDataAdd.length; i++) {
				if (otherAsDataAdd[i].csi == rowData2[1]) {
					fstArraySum += otherAsDataAdd[i].days;
					let fst = fstArraySum;
					let scnd = rowData2[5];
					let third = rowData1[5];
					rowData4[5] = fst + scnd + third;

				}
			}

		}
		if (rowiRData1.length > 0) {
			rowData4[5] = rowiRData1[5];
		}
		if (rowiPData1.length > 0) {
			if (rowData4.length > 0) {
				rowData4[5] += rowiPData1[5];
			} else {
				if (rowData1[1] == rowiPData1[1] && rowiPData1[1] == rowData2[1]) {
					let fst = rowData1[5];
					let scnd = rowData2[5];
					let third = rowiPData1[5];
					rowData4[5] = fst + scnd + third;
				} else {
					rowData4[5] = rowiPData1[5];
				}
			}

		}
	}
	if (rowData1.length > 0 && rowData3.length > 0 && flag1 == false && flag2 == false) {
		flag3 = true;
		if (rowData1[1] == rowData3[1]) {
			let fst = rowData1[5];
			let scnd = rowData3[5];
			rowData4[5] = fst + scnd;
		}
	}
	if (rowiPData1.length > 0 && flag1 == false && flag2 == false && flag3 == false) {

		if (ipDataAdd.length > 1) {
			var iPsum = 0;
			for (let i = 0; i < ipDataAdd.length; i++) {

				iPsum += ipDataAdd[i].days;
				rowData4[5] = iPsum;
			}
		} else {
			rowData4[5] = rowiPData1[5];
		}
	}
	if (rowiRData1.length > 0 && flag1 == false && flag2 == false && flag3 == false) {
		rowData4[5] = rowiRData1[5];
	}

	if (otherAsDataAdd.length > 0 && flag1 == false && flag2 == false && flag3 == false) {
		let fstArraySum = 0;
		for (let i = 0; i < otherAsDataAdd.length; i++) {
			fstArraySum += otherAsDataAdd[i].days;
			let fst = fstArraySum;
			rowData4[5] = fst;
		}
	}
	
	newSheet.addRow(rowData4);

	cleanData();
	if (flag1 == true) {
		rowData1 = [];
		rowData2 = [];
		rowData3 = [];
		rowiRData1 = [];
		rowiPData1 = [];
		rowData5 = [];
		rowData4 = [];
		allDataAdd = [];
	} else if (flag2 == true) {
		rowData1 = [];
		rowData2 = [];
		rowData3 = [];
		rowiRData1 = [];
		rowiPData1 = [];
		rowData5 = [];
		rowData4 = [];
		allDataAdd = [];
	} else {
		rowData1 = [];
		rowData2 = [];
		rowData3 = [];
		rowiRData1 = [];
		rowiPData1 = [];
		rowData5 = [];
		rowData4 = [];
		allDataAdd = [];
	}
}

function cleanData() {
	rowData1 = [];
	rowData2 = [];
	rowData3 = [];
	rowiRData1 = [];
	rowiPData1 = [];
	rowData5 = [];
	rowData4 = [];
	allDataAdd = [];
}

