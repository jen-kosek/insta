"""REST API for posts."""
import flask
import insta485
from insta485.views.accounts import verify_password
from insta485.api import exceptions


@insta485.app.route('/api/v1/posts/<int:postid_url_slug>/')
def get_post(postid_url_slug):
    """Return post on postid."""
    logname = check_login()

    # Connect to database
    connection = insta485.model.get_db()

    # Query database for post info and owner's photo
    cur = connection.execute(
        "SELECT posts.postid, posts.filename, posts.owner, "
        "posts.created, users.filename as owner_filename "
        "FROM posts, users "
        "WHERE postid =?",
        [postid_url_slug]
    )
    post = cur.fetchall()

    # Check if post exists --> if not raise 404 not found
    if not post:
        raise exceptions.InvalidUsage("Not found", status_code=404)

    # Build context and return in JSON format
    context = get_post_context(post[0], logname)
    return flask.jsonify(**context)


@insta485.app.route('/api/v1/posts/')
def get_posts():
    """Return posts based on argument specifications."""
    logname = check_login()

    # Get size (number of posts to desplay), default to 10 if not specified
    size = flask.request.args.get("size", default=10, type=int)

    # Get page (number of page to display), default to 1 if not specified
    page = flask.request.args.get("page", default=0, type=int)

    # Get postid_lte (post_id of the newest post to show),
    # default to num posts if not specified
    postid_lte = flask.request.args.get("postid_lte", type=int)

    # Check that args are valid
    if size < 0 or page < 0:
        raise exceptions.InvalidUsage("Bad Request", status_code=400)

    # Connect to database
    connection = insta485.model.get_db()

    # Query database for latest postid
    cur = connection.execute(
        "SELECT MAX(postid) as latest_post "
        "FROM posts "
    )
    latest_post = cur.fetchall()

    # Set postid_lte to total number of posts if not specified
    if not postid_lte:
        postid_lte = latest_post[0]['latest_post']

    # Otherwise check bounds
    if postid_lte < 0 or postid_lte > latest_post[0]['latest_post']:
        raise exceptions.InvalidUsage("Bad Request", status_code=400)

    # Figure out range of postids to show
    first_post_id = postid_lte - size * page

    # Query database for posts by logname ans users that logname follows
    cur = connection.execute(
        "SELECT posts.postid, posts.owner, posts.filename, "
        "posts.created, users.filename as owner_filename "
        "FROM posts INNER JOIN users "
        "ON posts.owner = users.username "
        "WHERE posts.postid <= ? "
        "AND (posts.owner = ? OR posts.owner IN "
        "(SELECT username2 FROM following WHERE username1 = ?) )"
        "ORDER BY posts.postid DESC "
        "LIMIT ?",
        [first_post_id, logname, logname, size]
    )
    posts = cur.fetchall()

    results = []
    # Grab comments and likes for each post
    for post in posts:
        results.append(get_post_context(post, logname))

    # Figure out url of next page of posts if there are more
    next_page = ''

    if len(posts) == size:
        # Query the db to see if there are any more posts
        cur = connection.execute(
            "SELECT posts.postid "
            "FROM posts INNER JOIN users "
            "ON posts.owner = users.username "
            "WHERE posts.postid <= ? "
            "AND (posts.owner = ? OR posts.owner IN "
            "(SELECT username2 FROM following WHERE username1 = ?) )"
            "ORDER BY posts.postid DESC ",
            [posts[size - 1]['postid'], logname, logname]
        )
        more_posts = cur.fetchall()

        if more_posts:
            next_page = flask.url_for('get_posts', size=size, page=(page+1),
                                      postid_lte=postid_lte)

    # Get current url (with args if exist, without if they dont)
    url = flask.request.path
    if flask.request.args:
        url = flask.request.full_path
    if not url:
        url = ''

    # Built context and return in JSON format
    context = {
        'next': next_page,
        'results': results,
        'url': url
    }
    return flask.jsonify(**context)


def get_post_context(post, logname):
    """Return a dictionary of the given post's info."""
    # Connect to database
    connection = insta485.model.get_db()

    # Get all comments
    cur = connection.execute(
        "SELECT commentid, owner, text "
        "FROM comments "
        "WHERE postid=? "
        "ORDER BY commentid ASC",
        [post["postid"]]
    )
    comments = cur.fetchall()

    # Fill in info for each comment
    for comment in comments:
        comment['ownerShowUrl'] = f"/users/{comment['owner']}/"
        comment['url'] = f"/api/v1/comments/{str(comment['commentid'])}/"
        comment['lognameOwnsThis'] = (comment['owner'] == logname)

    # Num likes
    cur = connection.execute(
        "SELECT count(likeid) as num_likes "
        "FROM likes "
        "WHERE postid=?",
        [post["postid"]]
    )
    likes = cur.fetchall()

    # Check if logname liked the post
    cur = connection.execute(
        "SELECT likeid "
        "FROM likes "
        "WHERE postid=? AND owner=?",
        [post["postid"], logname]
    )
    logname_likeid = cur.fetchall()
    logname_likes_this = False
    like_url = None
    if logname_likeid:
        logname_likes_this = True
        like_url = f"/api/v1/likes/{logname_likeid[0]['likeid']}/"

    # Build context for the post
    post_context = {
            "comments": comments,
            "created": post["created"],
            "imgUrl": "/uploads/{}".format(post["filename"]),
            "likes": {"lognameLikesThis": logname_likes_this,
                      "numLikes": likes[0]["num_likes"],
                      "url": like_url},
            "owner": post['owner'],
            "ownerImgUrl": "/uploads/{}".format(post["owner_filename"]),
            "ownerShowUrl": "/users/{}/".format(post["owner"]),
            "postShowUrl": "/posts/{}/".format(post["postid"]),
            "postid": post["postid"],
            "url": "/api/v1/posts/{}/".format(post["postid"])
        }

    return post_context


def check_login():
    """Check if user is logged and returns logname if so."""
    # Check if logged in via session or http basic access authenication
    if 'logname' in flask.session:
        return flask.session['logname']

    username = flask.request.authorization['username']
    password = flask.request.authorization['password']

    # Raise exception if not logged in
    if (not username or not password or
       not verify_password(username, password)):
        raise exceptions.InvalidUsage('Forbidden', status_code=403)

    # Otherwise return username as logname
    return username
