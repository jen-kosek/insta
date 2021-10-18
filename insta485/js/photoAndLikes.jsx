import React from 'react';
import PropTypes from 'prop-types';
import PostPhoto from './postPhoto';
import LikeUnlikeButton from './likeUnlikeButton';

class PhotoAndLikes extends React.Component {
  constructor(props) {
    super(props);
    const { numLikes, likeUrl, lognameLikesThis } = this.props;
    this.state = {
      numLikes,
      likeUrl,
      lognameLikesThis,
      buttonDisabled: false,
    };
    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);
    this.handleLike = this.handleLike.bind(this);
    this.handleUnlike = this.handleUnlike.bind(this);
  }

  // handles the like/unlikes button being pressed
  handleButtonClick() {
    const { lognameLikesThis, buttonDisabled } = this.state;
    if (lognameLikesThis) this.handleUnlike();
    else if (!buttonDisabled) this.handleLike();
  }

  // handles a double click to the phtoto
  handleDoubleClick() {
    const { lognameLikesThis } = this.state;
    if (!lognameLikesThis) {
      this.handleLike();
    }
  }

  // likes the post
  handleLike() {
    // prevent from pressing the button to like again
    this.setState({ buttonDisabled: true });

    // update db and get new likeurl
    const { postid } = this.props;
    fetch(`/api/v1/likes/?postid=${postid}`,
      { method: 'POST', credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((json) => {
        // set like url from response, enabled the button again,
        // change to unlike
        this.setState((prevState) => ({
          lognameLikesThis: true,
          numLikes: prevState.numLikes + 1,
          likeUrl: json.url,
          buttonDisabled: false,
        }));
      })
      .then(() => {})
      .catch((error) => console.log(error));
  }

  // unlikes the post
  handleUnlike() {
    const { likeUrl } = this.state;

    // update state
    this.setState((prevState) => (
      {
        lognameLikesThis: false,
        numLikes: prevState.numLikes - 1,
      }
    ));

    // update db
    fetch(likeUrl, { method: 'DELETE', credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        // update state
        this.setState(
          { likeUrl: null },
        );
      })
      .catch((error) => console.log(error));
  }

  // renders the post photo, the like counts, and the like/unlike button
  render() {
    const { numLikes, lognameLikesThis } = this.state;
    const { imgUrl } = this.props;

    return (
      <div>
        <PostPhoto
          imgUrl={imgUrl}
          handleDoubleClick={this.handleDoubleClick}
        />
        <LikeUnlikeButton
          lognameLikesThis={lognameLikesThis}
          handleButtonClick={this.handleButtonClick}
        />
        <p>
          { numLikes }
          {' '}
          { (numLikes === 1) ? 'like' : 'likes' }
        </p>
      </div>
    );
  }
}

PhotoAndLikes.propTypes = {
  postid: PropTypes.number.isRequired,
  numLikes: PropTypes.number.isRequired,
  likeUrl: PropTypes.string,
  imgUrl: PropTypes.string.isRequired,
  lognameLikesThis: PropTypes.bool.isRequired,
};

PhotoAndLikes.defaultProps = {
  likeUrl: null,
};

export default PhotoAndLikes;
