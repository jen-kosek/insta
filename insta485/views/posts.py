"""
Insta485 post views.

URLs include:
/post/<posid_url_slug>
/post/?target=URL
/likes/?target=URL
"""
import os
import flask
import arrow
import insta485
from insta485.views.accounts import save_photo


@insta485.app.route('/posts/<postid_url_slug>/', methods=['GET'])
def show_posts(postid_url_slug):
    """Display /post/<posid_url_slug> route."""
    # Not logged in --> go to login page
    if 'logname' not in flask.session:
        return flask.redirect(flask.url_for('show_accounts_login'))

    # Connect to database
    connection = insta485.model.get_db()

    # Get post info and owner's photo filename
    cur = connection.execute(
        "SELECT posts.postid, posts.filename, posts.owner, "
        "posts.created as timestamp, users.filename as owner_filename "
        "FROM posts INNER JOIN users "
        "ON posts.owner=users.username "
        "WHERE posts.postid=?",
        [postid_url_slug]
    )
    post = cur.fetchall()
    post = post[0]  # Move from list

    post = get_post_info(post)

    # Add database info to context
    context = {"show_logname": True,
               "logname": flask.session['logname'],
               "post": post}

    return flask.render_template("post.html", **context)


@insta485.app.route('/posts/', methods=['POST'])
def post_posts():
    """Display /post/ route."""
    # Not logged in --> go to login page
    if 'logname' not in flask.session:
        return flask.redirect(flask.url_for('show_accounts_login'))

    if flask.request.form['operation'] == 'create':
        # Check that file is not empty
        if 'file' not in flask.request.files:
            flask.abort(400)

        # Save file
        path = str(save_photo(flask.request.files['file']))

        # Connect to database
        connection = insta485.model.get_db()

        # Add new post to db
        cur = connection.execute(
            "INSERT INTO posts(filename, owner) "
            "VALUES (?,?)",
            [path, flask.session['logname']]
        )

    if flask.request.form['operation'] == 'delete':
        # Connect to database
        connection = insta485.model.get_db()

        # Get the owner of the post to delete
        cur = connection.execute(
            "SELECT owner, filename FROM posts "
            "WHERE postid=?",
            [flask.request.form['postid']]
        )
        info = cur.fetchall()

        # Cannot delete a post you don't own --> abort
        if info[0]['owner'] != flask.session['logname']:
            flask.abort(403)

        # Delete the image file
        path = insta485.app.config["UPLOAD_FOLDER"]/info[0]['filename']
        if os.path.exists(path):
            os.remove(path)

        # Remove the post from db
        cur = connection.execute(
            "DELETE FROM posts "
            "WHERE postid=?",
            [flask.request.form['postid']]
        )

    # Redirect to URL (or /user/logname if not specified)
    url = flask.request.args.get('target')
    if not url:
        url = flask.url_for('show_user',
                            user_url_slug=flask.session['logname'])
    return flask.redirect(url)


@insta485.app.route('/likes/', methods=['POST'])
def post_likes():
    """Display /likes/ route."""
    # Not logged in --> go to login page
    if 'logname' not in flask.session:
        return flask.redirect(flask.url_for('show_accounts_login'))

    # operation not set --> redirect to index page
    if not flask.request.form['operation']:
        return flask.redirect(flask.url_for('show_index'))

    # Check if previously liked the post
    connection = insta485.model.get_db()
    cur = connection.execute(
        "SELECT likeid FROM likes "
        "WHERE owner=? AND postid=?",
        [flask.session['logname'],
         flask.request.form['postid']]
    )
    likeid = cur.fetchall()

    # like
    if flask.request.form['operation'] == 'like':

        # Already liked --> abort
        if likeid:
            flask.abort(409)

        # Add like
        cur = connection.execute(
            "INSERT INTO likes(owner, postid) "
            "VALUES (?,?)",
            [flask.session['logname'],
             flask.request.form['postid']]
        )

    # unlike
    if flask.request.form['operation'] == 'unlike':

        # Have not liked --> abort
        if not likeid:
            flask.abort(409)

        # Delete the like from the db
        cur = connection.execute(
            "DELETE FROM likes "
            "WHERE likeid=?",
            [likeid[0]['likeid']]
        )

    # redirect to URL (or index if not specified)
    url = flask.request.args.get('target')
    if not url:
        url = flask.url_for('show_index')
    return flask.redirect(url)


@insta485.app.route('/comments/', methods=['POST'])
def post_comments():
    """Display /comments/ route."""
    # Not logged in --> go to login page
    if 'logname' not in flask.session:
        return flask.redirect(flask.url_for('show_accounts_login'))

    # ?target not set --> redirect to index page
    if not flask.request.form['operation']:
        return flask.redirect(flask.url_for('show_index'))

    # create a new comment
    if flask.request.form['operation'] == 'create':

        # Cannot create an empty comment --> abort
        if (not flask.request.form['postid'] or
           not flask.request.form['text']):
            flask.abort(400)

        # Connect to database
        connection = insta485.model.get_db()

        # Query database for user current info
        cur = connection.execute(
            "INSERT INTO comments(owner, postid, text) "
            "VALUES (?,?,?)",
            [flask.session['logname'],
             flask.request.form['postid'],
             flask.request.form['text']]
        )
        owner = cur.fetchall()

    # Delete a new comment
    if flask.request.form['operation'] == 'delete':

        # Check owner of comment
        # Connect to database
        connection = insta485.model.get_db()

        # Query database for user current info
        cur = connection.execute(
            "SELECT owner "
            "FROM comments "
            "WHERE commentid=?",
            [flask.request.form['commentid']]
        )
        owner = cur.fetchall()

        # Cannot delete a comment you don't own --> abort
        if not owner[0] or owner[0]['owner'] != flask.session['logname']:
            flask.abort(403)

        # If owner is current user, then delete the comment
        cur = connection.execute(
            "DELETE FROM comments "
            "WHERE commentid=?",
            [flask.request.form['commentid']]
        )

    # redirect to URL (or index if not specified)
    url = flask.request.args.get('target')
    if not url:
        url = flask.url_for('show_index')
    return flask.redirect(url)


def get_post_info(post):
    """Return all needed data about a post."""
    # Connect to database
    connection = insta485.model.get_db()

    # Humanize timestamp
    arrow_object = arrow.get(post['timestamp'])
    post['timestamp'] = arrow_object.humanize()

    # Get comments
    cur = connection.execute(
        "SELECT * "
        "FROM comments "
        "WHERE postid=?",
        [post['postid']]
    )
    get_comments = cur.fetchall()
    post['comments'] = get_comments

    # Get num likes
    cur = connection.execute(
        "SELECT COUNT(likeid) as num_likes "
        "FROM likes "
        "WHERE postid=?",
        [post['postid']]
    )
    post_num_likes = cur.fetchall()
    post['num_likes'] = post_num_likes[0]['num_likes']

    # Get whether the post is liked by logname user
    cur = connection.execute(
        "SELECT owner "
        "FROM likes "
        "WHERE postid=? AND owner=?",
        [post['postid'], flask.session['logname']]
    )
    likes = cur.fetchall()
    if likes:
        post['show_like'] = True
    else:
        post['show_like'] = False

    return post
