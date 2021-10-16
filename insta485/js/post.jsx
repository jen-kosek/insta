import React from 'react';
import PropTypes from 'prop-types';
import PhotoAndLikes from './likes';
import { Comment, CommentForm } from './comments';
import moment from 'moment';

class Post extends React.Component {
    /* Display number of image and post owner of a single post
    */

    constructor(props) {
        // Initialize mutable state
        super(props);
        this.state = { comments: this.props };
    }

    // returns list of comments
    getComments(){
        return this.state.comments.map((comment) => {
            <Comment commentinfo = { comment } />
        })
    }

    render() {
        // This line automatically assigns this.state.imgUrl to the const variable imgUrl
        // and this.state.owner to the const variable owner
        const { imgUrl, owner, ownerImgUrl, postid, numLikes, lognameLikesThis,
            likeUrl, ownerShowUrl, postShowUrl, created } = this.props;

        // get human readable timestamp
        let timestamp = moment(created).fromNow(); 

        // Render number of post image and post owner
        return (
        <div className="post">
            <img className="pfp"
            src={ ownerImgUrl } 
            alt={ ownerImgUrl }/>
            <a href={ ownerShowUrl }><b>{ owner }</b></a>
            <p><a href={ postShowUrl }> { timestamp } </a></p>
            <PhotoAndLikes 
                numLikes = { numLikes } 
                likeUrl = { likeUrl }
                lognameLikesThis = { lognameLikesThis }
                imgUrl = { imgUrl }
                postid = { postid } />             
        </div>
        );
    }
}

Post.propTypes = {
    comments: PropTypes.array.isRequired,
    imgUrl: PropTypes.string.isRequired,
    created: PropTypes.string.isRequired,
    numLikes: PropTypes.number.isRequired,
    lognameLikesThis: PropTypes.bool.isRequired,
    likeUrl: PropTypes.string,
    owner: PropTypes.string.isRequired,
    ownerImgUrl: PropTypes.string.isRequired,
    ownerShowUrl: PropTypes.string.isRequired,
    postShowUrl: PropTypes.string.isRequired,
    postid: PropTypes.number.isRequired
};

export default Post;