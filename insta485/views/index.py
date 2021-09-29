"""
Insta485 index (main) view.

URLs include:
/
"""

import os
import flask
import insta485
from insta485.views.posts import get_post_info


@insta485.app.route('/')
def show_index():
    """Display / route."""
    # Not logged in --> go to login page
    if 'logname' not in flask.session:
        return flask.redirect(flask.url_for('show_accounts_login'))

    # Connect to database
    connection = insta485.model.get_db()

    # Query database for users that logname is following
    cur = connection.execute(
        "SELECT username2 AS username "
        "FROM following "
        "WHERE username1=?",
        [flask.session['logname']]
    )
    users = cur.fetchall()
    users.append({'username': flask.session['logname']})
    posts = []

    # Get all posts of each user in users
    for user in users:
        cur = connection.execute(
            "SELECT posts.postid, posts.filename, posts.owner, "
            "posts.created as timestamp, users.filename AS owner_filename "
            "FROM posts INNER JOIN users "
            "ON posts.owner=users.username "
            "WHERE owner=?",
            [user['username']]
        )
        user_posts = cur.fetchall()
        posts.extend(user_posts)

    # Get related info for each post
    for post in posts:
        post = get_post_info(post)

    # Add database info to context
    context = {"show_logname": True,
               "logname": flask.session['logname'],
               "posts": posts}

    return flask.render_template("index.html", **context)


@insta485.app.route('/explore/')
def show_explore():
    """Display /explore/ route."""
    # Not logged in --> go to login page
    if 'logname' not in flask.session:
        return flask.redirect(flask.url_for('show_accounts_login'))

    # Connect to database
    connection = insta485.model.get_db()

    # Query database for users that logname is NOT following
    cur = connection.execute(
        'SELECT DISTINCT users.username, users.filename '
        'FROM users, following '
        'WHERE users.username=following.username2 '
        'AND NOT username2=? '
        'EXCEPT '
        'SELECT DISTINCT users.username, users.filename '
        'FROM users, following '
        'WHERE users.username=following.username2 '
        'AND username1=?',
        [flask.session['logname'],
         flask.session['logname']]
    )

    not_following = cur.fetchall()

    # Add database info to context
    context = {"show_logname": True,
               "logname": flask.session['logname'],
               "not_following": not_following}

    return flask.render_template("explore.html", **context)


@insta485.app.route('/uploads/<filename>')
def check_upload(filename):
    """Display /uploads/<filename>/ route."""
    # Check if user is authenticated
    if 'logname' not in flask.session:
        flask.abort(403)

    # Query database for picture to exist
    if not os.path.exists(insta485.app.config["UPLOAD_FOLDER"]/filename):
        flask.abort(404)

    return flask.send_from_directory(
        insta485.app.config["UPLOAD_FOLDER"], filename)
