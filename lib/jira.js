//=========
// JIRA API
//=========

var jira = {};
var JiraApi = require('jira-client');

// Initialize 
var api = new JiraApi({
    protocol: process.env.JIRA_PROTOCOL,
    host: process.env.JIRA_HOST,
    username: process.env.JIRA_USER,
    password: process.env.JIRA_PASS,
    apiVersion: '2',
    strictSSL: true
});

jira.getIssue = function (issueKey) {
    api.findIssue(issueKey).then(function (issue) {
        var reply = "Issue: " + issueKey + " " + issue.fields.summary;
        return reply;
    });
}

module.exports = jira;