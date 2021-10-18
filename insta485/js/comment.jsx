import React from 'react';
import PropTypes from 'prop-types';
import DeleteCommentButton from './deleteCommentButton';

const Comment = (props) => {
  const {
    owner, ownerUrl, lognameOwnsThis, text, commentid, commentUrl, deleteComment,
  } = props;

  return (
    <div>
      <a href={ownerUrl}><b>{owner}</b></a>
      <p>{text}</p>
      { lognameOwnsThis
        ? (
          <DeleteCommentButton
            commentid={commentid}
            commentUrl={commentUrl}
            deleteComment={deleteComment}
          />
        ) : <p /> }
    </div>
  );
};

Comment.propTypes = {
  owner: PropTypes.string.isRequired,
  ownerUrl: PropTypes.string.isRequired,
  lognameOwnsThis: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired,
  commentid: PropTypes.number.isRequired,
  commentUrl: PropTypes.string.isRequired,
  deleteComment: PropTypes.func.isRequired,
};

export default Comment;
