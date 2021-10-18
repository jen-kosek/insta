import React from 'react';
import PropTypes from 'prop-types';

class DeleteCommentButton extends React.Component {
  constructor(props) {
    super(props);
    this.handleButtonClick = this.handleButtonClick.bind(this);
  }

  // delete comment when the button is pressed
  handleButtonClick() {
    const { deleteComment, commentid, commentUrl } = this.props;
    deleteComment(commentid, commentUrl);
  }

  render() {
    return (
      <button
        type="button"
        onClick={this.handleButtonClick}
        className="delete-comment-button"
      >
        Delete comment
      </button>
    );
  }
}

DeleteCommentButton.propTypes = {
  commentid: PropTypes.number.isRequired,
  commentUrl: PropTypes.string.isRequired,
  deleteComment: PropTypes.func.isRequired,
};

export default DeleteCommentButton;
