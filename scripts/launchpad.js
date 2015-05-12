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

function printBug(bot, bug) {
  var lpUrl = 'https://api.launchpad.net/1.0/bugs/' + bug;

  robot.http(lp_url)
    .get()(function (err, res, body) {
      var content;
      if ((err !== null) || res.statusCode !== 200) {
        return msg.send("Unable to parse bug " + bugId + ", try again Señor.");
      }
      content = JSON.parse(body);
      bug.id = content.id;
      bug.title = content.title;
      bug.web_link = content.web_link;
      return robot.http(content.bug_tasks_collection_link)
        .get()(function (err, res, body) {
          var task;
          task = JSON.parse(body)
            .entries[0];
          bug.status = task.status;
          bug.display_name = task.bug_target_display_name;
          bug.importance = task.importance;
          return msg.send((bug.display_name + "/" + bug.title) + (" (" + bug.status + "/" + bug.importance + ") ") + ("[http://pad.lv/" + bug.id + "]"));
        });
    });

}

module.exports = function (robot) {
  robot.hear(/(bug|\#|LP|lp)\s*?(\d{6,})/i, function (msg) {
    var bugId = msg.match[1];
    printBug(robot, bugId);
  });

  robot.hear(/(https:\/\/(?:bugs\.)?launchpad\.net\/.*\/)(\d{6,})/i, function (msg) {
    var bugId = msg.match[1];
    printBug(robot, bugId);
  });
};
