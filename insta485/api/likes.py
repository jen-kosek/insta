"""REST API for likes."""
import flask
import insta485
from insta485.api.posts import check_login
from insta485.api import exceptions


@insta485.app.route('/api/v1/likes/', methods=["POST"])
def add_like():
    """Add a new like to likes.

    Example:
    {
        "likeid": 6,
        "url": "/api/v1/likes/6/"
    }
    """
    logname = check_login()

    # Get postid of input
    post_num = flask.request.args.get("postid", type=int)

    if not post_num:
        raise exceptions.InvalidUsage("Bad Request", status_code=400)

    # Connect to database
    connection = insta485.model.get_db()

    # Check if like already exists
    cur = connection.execute(
        "SELECT likeid FROM likes "
        "WHERE likes.owner =? AND likes.postid =?",
        [logname, post_num]
    )

    like_check = cur.fetchall()

    # If like exists, return with an error
    if like_check:
        raise exceptions.InvalidUsage("Conflict", status_code=409)

    # Otherwise, insert new like
    cur = connection.execute(
        "INSERT INTO likes (owner, postid) "
        "VALUES (?, ?)",
        [logname, post_num]
    )

    # Get the new likeid
    cur = connection.execute(
        "SELECT last_insert_rowid() as num"
    )
    rowid = cur.fetchall()
    temp = rowid[0]['num']

    # Set likeid and url
    context = {
        "likeid": temp,
        "url": "/api/v1/comments/" + str(temp) + "/"
    }

    return flask.jsonify(**context), 201


@insta485.app.route('/api/v1/likes/<int:likeid>/', methods=["DELETE"])
def delete_like(likeid):
    """Delete a like from likes."""
    logname = check_login()

    # Connect to database
    connection = insta485.model.get_db()

    cur = connection.execute(
        "DELETE FROM likes "
        "WHERE likes.likeid=? AND likes.owner =?",
        [likeid, logname]
    )

    return '', 204
