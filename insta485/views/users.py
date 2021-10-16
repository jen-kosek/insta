"""
Insta485 user views.

URLs include:
/users/<user_url_slug>/
/users/<user_url_slug>/followers/
/users/<user_url_slug>/following/
"""
import flask
import insta485


@insta485.app.route('/users/<user_url_slug>/', methods=['GET'])
def show_user(user_url_slug):
    """Display /users/<user_url_slug>/ route."""
    # Not logged in --> go to login page
    if 'logname' not in flask.session:
        return flask.redirect(flask.url_for('show_accounts_login'))

    # Connect to database
    connection = insta485.model.get_db()

    # Get full name
    name = connection.execute(
        'SELECT fullname FROM users WHERE username = ?',
        [user_url_slug]
    )

    names = name.fetchall()

    # Check if username exists
    if not names:
        flask.abort(404)

    # Get relationship
    ship = connection.execute(
        'SELECT username1 FROM following WHERE '
        'username1 = ? AND username2 = ?',
        [flask.session['logname'], user_url_slug]
    )

    # Get all of user's posts
    user_posts = connection.execute(
        'SELECT * FROM posts WHERE posts.owner = ?',
        [user_url_slug]
    )

    # Get number of user's posts
    num_posts = connection.execute(
        'SELECT COUNT(postid) AS posts FROM posts WHERE posts.owner = ?',
        [user_url_slug]
    )

    # Get num followers
    follows = connection.execute(
        'SELECT COUNT(username1) AS following FROM following WHERE '
        'username2 = ?',
        [user_url_slug]
    )

    # Get num following
    folloween = connection.execute(
        'SELECT COUNT(username2) AS following FROM following WHERE '
        'username1 = ?',
        [user_url_slug]
    )

    # Fetch from queries
    number_posts = num_posts.fetchall()
    ships = ship.fetchall()
    follows_entry = follows.fetchall()
    following_entry = folloween.fetchall()
    list_posts = user_posts.fetchall()

    # Add database info to context
    context = {"logname": flask.session['logname'],
               "username": user_url_slug,
               "logname_follows_username": False,
               "total_posts": number_posts[0]['posts'],
               "followers": follows_entry[0]['following'],
               "following": following_entry[0]['following'],
               "fullname": names[0]['fullname'],
               "posts": list_posts,
               "show_logname": True}

    if ships:
        context["logname_follows_username"] = True

    return flask.render_template("user.html", **context)


@insta485.app.route('/users/<user_url_slug>/followers/', methods=['GET'])
def show_followers(user_url_slug):
    """Display /users/<user_url_slug>/followers/ route."""
    # Not logged in --> go to login page
    if 'logname' not in flask.session:
        return flask.redirect(flask.url_for('show_accounts_login'))

    # Connect to database
    connection = insta485.model.get_db()

    # Check if username exists
    name = connection.execute(
        'SELECT filename FROM users WHERE username = ?',
        [user_url_slug]
    )
    names = name.fetchall()
    if not names:
        flask.abort(404)

    # Get list of followers
    follows = connection.execute(
        'SELECT username, filename FROM users INNER JOIN following '
        'ON users.username=following.username1 WHERE username2 = ?',
        [user_url_slug]
    )
    follower_peeps = follows.fetchall()

    for follower in follower_peeps:
        cur = connection.execute(
            'SELECT username2 FROM following '
            'WHERE username1 = ? AND username2 = ?',
            [flask.session['logname'], follower['username']]
        )
        log_follows = cur.fetchall()
        if log_follows:
            follower['logged_follows'] = True
        else:
            follower['logged_follows'] = False

    # Add database info to context
    context = {"logname": flask.session['logname'],
               "username": user_url_slug,
               "followers": follower_peeps,
               "show_logname": True}
    return flask.render_template("followers.html", **context)


@insta485.app.route('/users/<user_url_slug>/following/', methods=['GET'])
def show_following(user_url_slug):
    """Display /users/<user_url_slug>/following/ route."""
    # Not logged in --> go to login page
    if 'logname' not in flask.session:
        return flask.redirect(flask.url_for('show_accounts_login'))

    # Connect to database
    connection = insta485.model.get_db()

    # Check if username exists
    name = connection.execute(
        'SELECT filename FROM users WHERE username = ?',
        [user_url_slug]
    )
    names = name.fetchall()
    if not names:
        flask.abort(404)

    # Get list of following
    followings = connection.execute(
        'SELECT username, filename FROM users INNER JOIN following '
        'ON users.username=following.username2 WHERE username1 = ?',
        [user_url_slug]
    )
    following_peeps = followings.fetchall()

    for followee in following_peeps:
        cur = connection.execute(
            'SELECT username2 FROM following '
            'WHERE username1 = ? AND username2 = ?',
            [flask.session['logname'], followee['username']]
        )
        log_follows = cur.fetchall()
        if log_follows:
            followee['logged_follows'] = True
        else:
            followee['logged_follows'] = False

    # Add database info to context
    context = {"logname": flask.session['logname'],
               "username": user_url_slug,
               "following": following_peeps,
               "show_logname": True}
    return flask.render_template("following.html", **context)


@insta485.app.route('/following/', methods=['POST'])
def post_following():
    """Display /users/<user_url_slug>/following/ route."""
    # Not logged in --> go to login page
    if 'logname' not in flask.session:
        return flask.redirect(flask.url_for('show_accounts_login'))

    # operation not set --> redirect to index page
    if not flask.request.form['operation']:
        return flask.redirect(flask.url_for('show_index'))

    # Check if already following
    con = insta485.model.get_db()
    curs = con.execute(
        "SELECT username1 FROM following "
        "WHERE username1=? AND username2=?",
        [flask.session['logname'],
         flask.request.form['username']]
    )
    following = curs.fetchall()

    # follow
    if flask.request.form['operation'] == 'follow':

        # Already following --> abort
        if following:
            flask.abort(409)

        # Add follow to db
        con.execute(
            "INSERT INTO following(username1, username2) "
            "VALUES (?,?)",
            [flask.session['logname'],
             flask.request.form['username']]
        )

    # unfollow
    if flask.request.form['operation'] == 'unfollow':

        # Have not following --> abort
        if not following:
            flask.abort(409)

        # Delete the following entry from the db
        con.execute(
            "DELETE FROM following "
            "WHERE username1=? AND username2=?",
            [flask.session['logname'],
             flask.request.form['username']]
        )

    # redirect to URL (or index if not specified)
    url = flask.request.args.get('target')
    if not url:
        url = flask.url_for('show_index')
    return flask.redirect(url)
