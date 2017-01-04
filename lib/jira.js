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
    apiVersion: process.env.JIRA_API_VERSION,
    strictSSL: process.env.JIRA_STRICT_SSL
});

jira.getIssue = function (issueKey) {
    console.log("got request for JIRA issue with jira.getIssue");
    api.findIssue(issueKey).then(function (issue) {
        console.log("found issue "+issueKey);
        var reply = "Issue: " + issueKey + " " + issue.fields.summary;
        console.log("replying "+reply);
        return reply;
    });
}

module.exports = jira;