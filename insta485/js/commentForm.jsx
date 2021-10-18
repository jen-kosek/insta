import React from 'react';
import PropTypes from 'prop-types';

class CommentForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { commentText: '' };

    this.handleChange = this.handleChange.bind(this);
    this.pressEnter = this.pressEnter.bind(this);
  }

  // function called when user types in text field
  handleChange(event) {
    this.setState({ commentText: event.target.value });
  }

  // prevents page relaoding on form submit
  static handleSubmit(event) {
    event.preventDefault();
  }

  // function called when enter pressed
  pressEnter(event) {
    const { sendComment, postid } = this.props;
    const { commentText } = this.state;

    if (event.key === 'Enter') {
      sendComment(postid, commentText);
      this.setState({ commentText: '' });
      event.preventDefault();
    }
  }

  render() {
    const { commentText } = this.state;

    return (
      <div>
        <form className="comment-form" onSubmit={CommentForm.handleSubmit}>
          <input
            type="text"
            value={commentText}
            onChange={this.handleChange}
            onKeyPress={this.pressEnter}
          />
        </form>
      </div>
    );
  }
}

CommentForm.propTypes = {
  postid: PropTypes.number.isRequired,
  sendComment: PropTypes.func.isRequired,
};

export default CommentForm;
