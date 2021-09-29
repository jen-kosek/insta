"""
Insta485 account pages.

URLs include:
/accounts/?target=URL
/accounts/login/
/accounts/logout/
/accounts/create/
/accounts/delete/
/accounts/edit/
/accounts/password/
"""
import uuid
import hashlib
import pathlib
import os
import flask
import insta485


@insta485.app.route('/accounts/', methods=['POST'])
def post_accounts():
    """Display /accounts/?target=URL route."""
    # ?target not set --> redirect to index page
    if not flask.request.form['operation']:
        return flask.redirect(flask.url_for('show_index'))

    # login --> authenticate and set cookie
    if flask.request.form['operation'] == "login":
        login()

    # create --> use info from FORM to create user
    if flask.request.form['operation'] == "create":
        create()

    # delete --> delete all info related to user
    if flask.request.form['operation'] == "delete":
        delete()

    # edit_account --> take form data to update user info
    if flask.request.form['operation'] == "edit_account":
        edit_account()

    # update_password --> verify current password and set new one
    if flask.request.form['operation'] == "update_password":
        update_password()

    # Redirect to URL (or index if not specified)
    url = flask.request.args.get('target')
    if not url:
        url = flask.url_for('show_index')
    return flask.redirect(url)


@insta485.app.route('/accounts/login/', methods=['GET'])
def show_accounts_login():
    """Display /accounts/login/ route."""
    # Already logged in --> redirect to index
    if 'logname' in flask.session:
        return flask.redirect(flask.url_for('show_index'))

    # Otherwise return login page
    context = {'show_logname': False}

    return flask.render_template("accounts_login.html", **context)


@insta485.app.route('/accounts/logout/', methods=['POST'])
def post_accounts_logout():
    """Display /accounts/logout/ route."""
    # Not logged in --> go to login page
    if 'logname' not in flask.session:
        return flask.redirect(flask.url_for('show_accounts_login'))

    # Clear cookies and redirect to login
    flask.session.clear()
    return flask.redirect(flask.url_for('show_accounts_login'))


@insta485.app.route('/accounts/create/', methods=['GET'])
def show_accounts_create():
    """Display /accounts/create/ route."""
    # Account already exists --> redirect to edit
    if 'logname' in flask.session:
        return flask.redirect(flask.url_for('show_accounts_edit'))

    # Otherwise return create page
    context = {'show_logname': False}

    return flask.render_template("accounts_create.html", **context)


@insta485.app.route('/accounts/delete/', methods=['GET'])
def show_accounts_delete():
    """Display /accounts/delete/ route."""
    # Not logged in --> go to login page
    if 'logname' not in flask.session:
        return flask.redirect(flask.url_for('show_accounts_login'))

    # Return delete page
    context = {'show_logname': True,
               'logname': flask.session['logname'],
               'accounts_url': flask.url_for('post_accounts'),
               'accounts_create_url': flask.url_for('show_accounts_create')}

    return flask.render_template("accounts_delete.html", **context)


@insta485.app.route('/accounts/edit/', methods=['GET'])
def show_accounts_edit():
    """Display /accounts/edit/ route."""
    # Not logged in --> go to login page
    if 'logname' not in flask.session:
        return flask.redirect(flask.url_for('show_accounts_login'))

    # Connect to database
    connection = insta485.model.get_db()

    # Query database for user current info
    cur = connection.execute(
        "SELECT filename "
        "FROM users "
        "WHERE username=?",
        [flask.session['logname']]
    )

    # Build context
    photo = cur.fetchall()
    context = {
        'photo': photo,
        'accounts_url': flask.url_for('post_accounts'),
        'current_url': flask.request.path,
        'accounts_pasword_url': flask.url_for('show_accounts_password'),
        'accounts_delete_url': flask.url_for('show_accounts_delete'),
        'logname': flask.session['logname'],
        'show_logname': True
    }

    return flask.render_template("accounts_edit.html", **context)


@insta485.app.route('/accounts/password/', methods=['GET'])
def show_accounts_password():
    """Display /accounts/password/ route."""
    # Not logged in --> go to login page
    if 'logname' not in flask.session:
        return flask.redirect(flask.url_for('show_accounts_login'))

    # Return password page
    context = {'show_logname': True,
               'logname': flask.session['logname'],
               'accounts_url': flask.url_for('post_accounts'),
               'accounts_edit_url': flask.url_for('show_accounts_edit')}

    return flask.render_template("accounts_password.html", **context)


def verify_password(username, password):
    """Hash given password and compare to the value in the db."""
    # Connect to database
    connection = insta485.model.get_db()

    # Query database for db password string
    cur = connection.execute(
        "SELECT password "
        "FROM users "
        "WHERE username=?",
        [username]
    )
    password_db_string = cur.fetchall()

    # User does not exit --> abort
    if not password_db_string:
        flask.abort(403)

    # Split password to get hashing info
    alg_salt_hash = password_db_string[0]['password'].split("$")
    algorithm = alg_salt_hash[0]
    salt = alg_salt_hash[1]
    db_password_hash = alg_salt_hash[2]

    # Hash given password
    hash_obj = hashlib.new(algorithm)
    password_salted = salt + password
    hash_obj.update(password_salted.encode('utf-8'))
    password_hash = hash_obj.hexdigest()

    # Hashed passwords don't match --> abort
    if password_hash != db_password_hash:
        flask.abort(403)


def set_password(username, password):
    """Set the password for a given username."""
    # Hash password
    algorithm = 'sha512'
    salt = uuid.uuid4().hex
    hash_obj = hashlib.new(algorithm)
    password_salted = salt + password
    hash_obj.update(password_salted.encode('utf-8'))
    password_hash = hash_obj.hexdigest()
    password_db_string = "$".join([algorithm, salt, password_hash])

    # Connect to database
    connection = insta485.model.get_db()

    # Query database for db password string
    connection.execute(
        "UPDATE users "
        "SET password=? "
        "WHERE username=?",
        [password_db_string, username]
    )


# returns the created path of the photo
def save_photo(fileobj):
    """Return created path of photo."""
    # Make filename for uploaded file
    # Unpack flask object
    filename = fileobj.filename

    # Compute base name (filename without directory).
    uuid_basename = "{stem}{suffix}".format(
        stem=uuid.uuid4().hex,
        suffix=pathlib.Path(filename).suffix
    )

    # Save to disk
    path = insta485.app.config["UPLOAD_FOLDER"]/uuid_basename
    fileobj.save(path)

    return uuid_basename


def login():
    """Login user."""
    # username or password is empty --> abort
    if (not flask.request.form['username'] or
       not flask.request.form['password']):
        flask.abort(400)

    # Authenicate
    verify_password(flask.request.form['username'],
                    flask.request.form['password'])

    # Set session cookie
    flask.session['logname'] = flask.request.form['username']


def create():
    """Create new user."""
    # Abort if any fields are empty
    if (not flask.request.form['username'] or
       not flask.request.form['password'] or
       not flask.request.form['fullname'] or
       not flask.request.form['email'] or
       'file' not in flask.request.files):
        flask.abort(400)

    # Abort if username already exists
    # Connect to database
    connection = insta485.model.get_db()

    # Check db for username
    cur = connection.execute(
        "SELECT username "
        "FROM users "
        "WHERE username=?",
        [flask.request.form['username']]
    )
    result = cur.fetchall()
    if result:
        flask.abort(409)

    # Make filename for uploaded file
    # Unpack flask object
    path = str(save_photo(flask.request.files['file']))

    # Create new user (add to db)
    cur = connection.execute(
        "INSERT INTO users(username, fullname, email, filename) "
        "VALUES (?,?,?,?)",
        [flask.request.form['username'],
            flask.request.form['fullname'],
            flask.request.form['email'],
            str(path)]
    )

    # Hash and add password to db
    set_password(flask.request.form['username'],
                 flask.request.form['password'])

    # Set session cookie
    flask.session['logname'] = flask.request.form['username']


def delete():
    """Delete user account."""
    # user not logged in --> abort
    if 'logname' not in flask.session:
        flask.abort(403)

    # Delete all post files created by the user
    # Connect to database
    connection = insta485.model.get_db()

    # Get filenames for all the images
    cur = connection.execute(
        "SELECT filename FROM posts "
        "WHERE owner=?",
        [flask.session['logname']]
    )
    filenames = cur.fetchall()
    cur = connection.execute(
        "SELECT filename FROM users "
        "WHERE username=?",
        [flask.session['logname']]
    )
    user_photo = cur.fetchall()
    filenames.extend(user_photo)

    # Delete all image files
    for filename in filenames:
        path = insta485.app.config["UPLOAD_FOLDER"]/filename['filename']
        os.remove(path)

    # Delete user from users table
    cur = connection.execute(
        "DELETE FROM users "
        "WHERE username=?",
        [flask.session['logname']]
    )

    # clear the user’s session
    flask.session.clear()


def edit_account():
    """Edit user account."""
    # user not logged in --> abort
    if 'logname' not in flask.session:
        flask.abort(403)

    # fullname or email empty --> abort
    if ('fullname' not in flask.request.form or
       'email' not in flask.request.form):
        flask.abort(400)

    # Edit user
    # Connect to database
    connection = insta485.model.get_db()

    # update user in users table
    cur = connection.execute(
        "UPDATE users "
        "SET fullname=?, email=? "
        "WHERE username=?",
        [flask.request.form['fullname'],
            flask.request.form['email'],
            flask.session['logname']]
    )

    # update photo if given and delete old one
    if 'file' in flask.request.files:
        cur = connection.execute(
            "SELECT filename FROM USERS "
            "WHERE username=?",
            [flask.session['logname']]
        )
        filename = cur.fetchall()

        path = insta485.app.config["UPLOAD_FOLDER"]/filename[0]['filename']
        if os.path.exists(path):
            os.remove(path)

        path = str(save_photo(flask.request.files['file']))
        cur = connection.execute(
            "UPDATE users "
            "SET filename=? "
            "WHERE username=?",
            [path, flask.session['logname']]
        )


def update_password():
    """Update user password."""
    # user not logged in --> abort
    if 'logname' not in flask.session:
        flask.abort(403)

    # any fields empty --> abort
    if (flask.request.form['password'] == "" or
       flask.request.form['new_password1'] == "" or
       flask.request.form['new_password2'] == ""):
        flask.abort(400)

    # Verify current password
    verify_password(flask.session['logname'],
                    flask.request.form['password'])

    # Verify that new passwords match
    if flask.request.form['new_password1'] != \
       flask.request.form['new_password2']:
        flask.abort(401)

    # Update password in database
    set_password(flask.session['logname'],
                 flask.request.form['new_password1'])
