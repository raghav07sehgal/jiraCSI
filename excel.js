
//To execute above function
var filePath = "D:/raghavData/PROJECTS/jira hmh api/Report.xlsx";
addRowToNewExcel(filePath);

function addRowToNewExcel(excelFilePath) {
    //excelFilePath: Provide path and file name for excel file
    var Excel = require('exceljs');// load exceljs module
    var workbook = new Excel.Workbook(); //create object of workbook
    //add sheet to workbook
    var newSheet = workbook.addWorksheet('TestData');
    let colIdUserName=1,colIdPassword=2,colIdResult=3; //create variable for column ID/column Number
      //Create an array  to enter row
    var rowData = [];
    rowData[colIdUserName] = 'Username_New'; //where 1 is first column   i.e. A
    rowData[colIdPassword] = 'Password_New';
    rowData[colIdResult] = 'Result_New';
    //use addRow to write row on created sheet
    newSheet.addRow(rowData);
 
    //use write file function to create new file
    workbook.xlsx.writeFile(excelFilePath) 
        .then(function () {
            console.log("excel file created successfully");
        });
}