# Description:
#   Interact with launchpad.net
#
# Several listeners for retrieving a bug
#
# Commands:
#   lp <bug> - retrieves bug
#
# Notes:
#    * Can access with the following statements
#      > lp 1
#      > this bug here #1 is broken
#      > and this bug LP#1 or this bug lp#2
#
# Author:
#   Adam Stokes <adam.stokes@ubuntu.com>

module.exports = (robot) ->
  robot.hear /[lpLP#]\s?(\d+)/i, (msg) ->
    console.log msg.match[1]
    bugId = msg.match[1]
    lp_url = 'https://api.launchpad.net/1.0/bugs/' + bugId
    bug = {}

    robot.http(lp_url)
      .get() (err, res, body) ->
        if err? or res.statusCode != 200
          return msg.send "Unable to parse bug #{bugId}, try again Señor."
        content = JSON.parse(body)
        bug.id = content.id
        bug.title = content.title
        bug.web_link = content.web_link
        robot.http(content.bug_tasks_collection_link)
          .get() (err, res, body) ->
            task = JSON.parse(body).entries[0]
            bug.status = task.status
            bug.display_name = task.bug_target_display_name
            bug.importance = task.importance
            msg.send "#{bug.display_name}/#{bug.title}" +
                     " (#{bug.status}/#{bug.importance}) "+
                     "[http://pad.lv/#{bug.id}]"
