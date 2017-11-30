//======
// JIRA COMMANDS
//======

var jira = {},
    JiraApi = require('jira-client'),

    // Initialize 
    api = new JiraApi({
        protocol: process.env.JIRA_PROTOCOL,
        host: process.env.JIRA_HOST,
        username: process.env.JIRA_USER,
        password: process.env.JIRA_PASS,
        apiVersion: process.env.JIRA_API_VERSION,
        strictSSL: process.env.JIRA_STRICT_SSL
    }),

    __jiraConfig = {
        "issuesUrl": api.protocol + "://" + api.host + "/browse/",
        "transitions": {
            "to do": "11",
            "in progress": "21",
            "done": "31",
            "testing": "41",
            "qa": "51",
            "wontfix": "61",
            "duplicate": "71"
        }
    };

//Syntax help
jira.help = function (bot, message) {
    bot.reply(message, "*JIRA COMMANDS* \n" +
        "*Usage:* jira [Options] \n" +
        "*Create issue:* create|new <Project key>; <Issue type>; <Summary>; <Description>  _(Semi colon delimited)_ \n" +
        "*Find issue:* get|find <issue-key> \n" +
        "*Transition issue:* set|transition <issue-key> [To do|In Progress|Done|Wontfix|Impeded] \n" +
        "*Comment on issue:* comment <issue-key> <comment> \n"
    );
};

// Create issue
jira.createIssue = function (bot, message) {
    var parts = message.match[1].split(";").map(function (p) {
        return p.trim()
    });
    var projectKey = parts[0],
        issueType = parts[1],
        summary = parts[2],
        description = parts[3];
    var addIssueJSON = {
        "fields": {
            "project": {
                "key": projectKey
            },
            "summary": summary,
            "description": description,
            "issuetype": {
                "name": issueType
            }
        }
    };
    api.addNewIssue(addIssueJSON).then(function (issue) {
        bot.reply(message, issue.key + " Created.\n" +
            __jiraConfig.issuesUrl + issue.key);
    }).catch(function (err) {
        console.log(err);
        bot.reply(message, "Sorry, couldn't create the issue for you.\n" +
            "Maybe the project key doesn't exist?\n" +
            "Check " + __jiraConfig.issuesUrl + projectKey);
    });
};

// Find issue
jira.findIssue = function (bot, message) {
    var issueKey = message.match[1];
    api.findIssue(issueKey).then(function (issue) {
        bot.reply(message, issueKey +
            "\n" + issue.fields.summary +
            "\n Status: " + issue.fields.status.name +
            "\n" + __jiraConfig.issuesUrl + issueKey);
    }).catch(function (err) {
        console.log(err);
        bot.reply(message, "Sorry, couldn't find the issue for you.\n" +
            "Maybe the issue doesn't exist?\n" +
            "Check " + __jiraConfig.issuesUrl + issueKey);
    });
};

// Transition issue
jira.transitionIssue = function (bot, message) {
    var match = message.match[1];
    var issueKey = match.substring(0, match.indexOf(" ")).trim();
    var transitionStr = match.substring(issueKey.length + 1, match.length).trim().toLowerCase();
    var transitionId = __jiraConfig.transitions[transitionStr];
    var transitionJSON = {
        "transition": {
            "id": transitionId
        }
    };
    api.transitionIssue(issueKey, transitionJSON).then(function (issue) {
        bot.reply(message, "Issue " + issueKey + " transitioned to " + transitionStr);
    }).catch(function (err) {
        console.log(err);
        bot.reply(message, "Sorry, couldn't transition the issue for you.\n" +
            "Either it doesn't exist or the transition type is wrong.\n" +
            "Check " + api.JIRA_HOST + "/rest/api/2/issue/" + issueKey + "/transitions?expand=transitions.fields for available transitions and corresponding ids");
    });
};

//Comment on issue
jira.commentOnIssue = function (bot, message) {
    var match = message.match[1];
    var issueKey = match.substring(0, match.indexOf(" ")).trim();
    var commentStr = match.substring(issueKey.length + 1, match.length).trim();
    console.log("commenting on issue " + issueKey);
    console.log("comment to be added:\n" + commentStr);
    var addCommentJSON = {
        "body": {
            "body": commentStr
        }
    };
    api.addComment(issueKey, commentStr).then(function (response) {
        bot.reply(message, "Comment added to " + issueKey + "\n" +
            __jiraConfig.issuesUrl + issueKey);
    }).catch(function (err) {
        console.log(err);
        bot.reply(message, "Sorry, couldn't add the comment for you.\n" +
            "Maybe the Issue doesn't exist?\n" +
            "Check " + __jiraConfig.issuesUrl + issueKey);
    });
};

module.exports = jira;