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
        this.state = { comments: this.props.comments };
    }

    //function called when user submits
    sendComment(event) {
        // HOPEFULLY ADD NEW COMMENT??????
        fetch('/api/v1/comments/', { method: 'POST', credentials: 'same-origin' })
            .then((response) => {
                if (!response.ok) throw Error(response.statusText);
                return response.json();
            })
            .then((data) => {
                this.setState( (prevState) => ({
                    comments: prevState.comments.concat(data)
                }))
            })
            .catch((error) => console.log(error));

        //prevents website from refreshing
        event.preventDefault();
    }

    render() {
        // This line automatically assigns this.state.imgUrl to the const variable imgUrl
        // and this.state.owner to the const variable owner
        const { imgUrl, owner, ownerImgUrl, postid, numLikes, lognameLikesThis,
            likeUrl, ownerShowUrl, postShowUrl, created } = this.props;

        // get human readable timestamp
        let timestamp = moment.utc(created).fromNow(); 

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
            { this.state.comments.map(comment => (
                <Comment key = { comment.commentid }
                    owner = { comment.owner }
                    ownerUrl = { comment.ownerShowUrl }
                    loganmeOwnsThis = { comment.lognameOwnsThis }
                    text = { comment.text }
                />
            ))}
            <CommentForm/>           
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