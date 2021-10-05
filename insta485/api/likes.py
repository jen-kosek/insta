"""REST API for likes."""
import flask
import insta485
from insta485.api.posts import check_login
from insta485.api import exceptions


@insta485.app.route('/api/v1/likes/?postid=<int:postid_url_slug>/',
                    methods=["POST"])
def add_like(postid_url_slug):
    """Add a new like to likeid.

    Example:
    {
        "likeid": 6,
        "url": "/api/v1/likes/6/"
    }
    """
    logname = check_login()

    # Connect to database
    connection = insta485.model.get_db()

    # Check if like already exists
    cur = connection.execute(
        "SELECT likeid FROM likes as id"
        "WHERE likes.owner =? AND likes.postid =?",
        [logname, postid_url_slug]
    )

    like_check = cur.fetchall()

    context = {}

    # If no like, get and set values
    if not like_check:
        cur = connection.execute(
            "INSERT INTO likes (owner, postid) "
            "VALUES (?, ?)",
            [logname, postid_url_slug]
        )

        # Get the like row
        cur = connection.execute(
            "SELECT last_insert_rowid() as num"
        )
        rowid = cur.fetchall()
        temp = rowid[0]['num']

        # Set commentid and url
        context['likeid'] = temp
        context['url'] = "/api/v1/comments/" + temp + "/"

        return flask.jsonify(**context), 201

    # Otherwise, return with an error
    raise exceptions.InvalidUsage("Conflict", status_code=409)


@insta485.app.route('/api/v1/likes/<int:likeid>/', methods=["DELETE"])
def delete_like(likeid):
    """Delete a like from likeid."""
    logname = check_login()

    # Connect to database
    connection = insta485.model.get_db()

    cur = connection.execute(
        "DELETE FROM likes "
        "WHERE likes.likeid=? AND likes.owner =?",
        [likeid, logname]
    )

    return 204
