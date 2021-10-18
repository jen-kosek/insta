import React from 'react';
import PropTypes from 'prop-types';

class PostPhoto extends React.Component {
  constructor(props) {
    super(props);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);
  }

  handleDoubleClick() {
    const { handleDoubleClick } = this.props;
    handleDoubleClick();
  }

  render() {
    const { imgUrl } = this.props;

    return (
      <img
        src={imgUrl}
        onDoubleClick={this.handleDoubleClick}
        alt={imgUrl}
      />
    );
  }
}

PostPhoto.propTypes = {
  imgUrl: PropTypes.string.isRequired,
  handleDoubleClick: PropTypes.func.isRequired,
};

export default PostPhoto;
