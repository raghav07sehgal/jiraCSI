//**********************Remote API Import File  Start*******
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors')
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var router = express.Router();

//**********************Local API Import File  Start********
var jiraApi = require('./jiraSearch.js');
var calDays = require('./calculateDays.js');


//jira api calls
router.post('/login', jiraApi.searchApi(req, res));

