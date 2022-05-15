var fs = require("fs");
var userDAO = require("../dao/userDAO");
var messageDAO = require("../dao/messageDAO");

exports.navigateToEditUser = (req, res) => {
    if (!req.session.loggedInUser) {
        return res.end("You are not logged in");
    }
    userDAO.getUsers().then((users) => {
        var currentUser = users.find((user) => {
            return user.id == req.session.loggedInUser.id;
        });

        fs.readFile("resources/editUser.html", function (err, html) {
            res.writeHead(200, { "Content-Type": "text/html" });
            html = html.toString();
            html = html.replace("{{username}}", currentUser.username);
            html = html.replace("{{introduction}}", currentUser.introduction);

            return res.end(html);
        });
    });
};

exports.editUser = (req, res) => {
    if (!req.session.loggedInUser) {
        return res.end("You are not logged in");
    }
    userDAO.getUsers().then((users) => {
        var userIndex = users.findIndex(function (user) {
            return user.id == req.session.loggedInUser.id;
        });
        users[userIndex].introduction = req.body.introduction;
        req.session.loggedInUser = users[userIndex];

        userDAO.setUsers(users);
    });
};

exports.navigateToViewUser = (req, res) => {
    if (!req.session.loggedInUser) {
        return res.end("You are not logged in");
    }
    userDAO.getUsers().then((users) => {
        messageDAO.getMessages().then((messages) => {
            let messageIndex = req.query.messageindex;

            var currentUser = users.find((user) => {
                return user.id == messages[messageIndex].user_id;
            });

            fs.readFile("resources/viewUser.html", function (err, html) {
                res.writeHead(200, { "Content-Type": "text/html" });
                html = html.toString();
                html = html.replace("{{username}}", currentUser.username);
                html = html.replace(
                    "{{introduction}}",
                    currentUser.introduction
                );

                return res.end(html);
            });
        });
    });
};
