import React from 'react';
import PropTypes from 'prop-types';

class LikeUnlikeButton extends React.Component {
  constructor(props) {
    super(props);
    this.handleButtonClick = this.handleButtonClick.bind(this);
  }

  handleButtonClick() {
    const { handleButtonClick } = this.props;
    handleButtonClick();
  }

  render() {
    const { lognameLikesThis } = this.props;

    return (
      <button
        type="button"
        onClick={this.handleButtonClick}
        className="like-unlike-button"
      >
        { lognameLikesThis ? 'unlike' : 'like' }
      </button>
    );
  }
}

LikeUnlikeButton.propTypes = {
  lognameLikesThis: PropTypes.bool.isRequired,
  handleButtonClick: PropTypes.func.isRequired,
};

export default LikeUnlikeButton;
