"""REST API for comments."""
import flask
import insta485
from insta485.api.posts import check_login
from insta485.api import exceptions


@insta485.app.route('/api/v1/comments/', methods=["POST"])
def add_comment():
    """Add a new comment to postid.

    Example:
    {
      "commentid": 3,
      "lognameOwnsThis": false,
      "owner": "michjc",
      "ownerShowUrl": "/users/michjc/",
      "text": "Cute overload!",
      "url": "/api/v1/comments/3/"
    }
    """
    logname = check_login()

    # Get postid of input
    post_num = flask.request.args.get("postid", type=int)

    if not post_num:
        raise exceptions.InvalidUsage("Bad Request", status_code=400)

    # Connect to database
    connection = insta485.model.get_db()

    context = {
        "lognameOwnsThis": True,
        "owner": logname,
        "ownerShowUrl": "/users/" + logname + "/",
        "text": flask.request.json["text"]
    }

    cur = connection.execute(
        "INSERT INTO comments (owner, postid, text) "
        "VALUES (?, ?, ?) ",
        [logname, post_num, flask.request.json["text"]]
    )

    # Get the comment row
    cur = connection.execute(
        "SELECT last_insert_rowid() as num"
    )
    rowid = cur.fetchall()
    temp = rowid[0]['num']

    # Set commentid and url
    context['commentid'] = temp
    context['url'] = "/api/v1/comments/" + str(temp) + "/"

    return flask.jsonify(**context), 201


@insta485.app.route('/api/v1/comments/<int:commentid>/', methods=["DELETE"])
def delete_comment(commentid):
    """Delete a comment from commentid."""
    logname = check_login()

    # Connect to database
    connection = insta485.model.get_db()

    connection.execute(
        "DELETE FROM comments "
        "WHERE comments.commentid=? AND comments.owner =?",
        [commentid, logname]
    )

    return '', 204
