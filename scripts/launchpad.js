// Description:
//   Interact with launchpad.net
//
// Several listeners for retrieving a bug
//
// Commands:
//   lp <bug> or #<bug> or LP#<bug> or https://bugs.launchpad.net/<bug> - retrieves bug
//
// Notes:
//    * Can access with the following statements
//      > lp 1
//      > this bug here #1 is broken
//      > and this bug LP#1 or this bug lp#2
//
// Author:
//   Adam Stokes <adam.stokes@ubuntu.com>

function printBug(robot, msg, bug) {
  var lpUrl = 'https://api.launchpad.net/1.0/bugs/' + bug;
  bugOut = {};

  robot.http(lpUrl)
    .get()(function (err, res, body) {
      var content;
      if ((err !== null) || res.statusCode !== 200) {
        return msg.send("Unable to parse bug " + bug + ", try again Señor.");
      }
      content = JSON.parse(body);
      bugOut.id = content.id;
      bugOut.title = content.title;
      bugOut.web_link = content.web_link;
      return robot.http(content.bug_tasks_collection_link)
        .get()(function (err, res, body) {
          var task;
          task = JSON.parse(body)
            .entries[0];
          bugOut.status = task.status;
          bugOut.display_name = task.bug_target_display_name;
          bugOut.importance = task.importance;
          return msg.send((bugOut.display_name + "/" + bugOut.title) + (" (" + bugOut.status + "/" + bugOut.importance + ") ") + ("[http://pad.lv/" + bugOut.id + "]"));
        });
    });

}

module.exports = function (robot) {
  robot.hear(/(bug|\#|LP|lp)\s*?(\d{6,})/i, function (msg) {
    var bugId = msg.match[2];
    printBug(robot, msg, bugId);
  });

  robot.hear(/(https:\/\/(?:bugs\.)?launchpad\.net\/.*\/)(\d{6,})/i, function (msg) {
    var bugId = msg.match[2];
    printBug(robot, msg, bugId);
  });
};
