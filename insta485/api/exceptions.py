"""Exception class for api."""
from flask import jsonify
import insta485


class InvalidUsage(Exception):
    """Exception class for invalid usage."""

    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        """Create InvalidUsage exception."""
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        """Return message for InvalidUsage exception."""
        return_val = dict(self.payload or ())
        return_val['message'] = self.message
        return return_val


@insta485.app.errorhandler(InvalidUsage)
def handle_invalid_usage(error):
    """Handle invalid usage exception."""
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response
