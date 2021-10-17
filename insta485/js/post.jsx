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

        this.sendComment = this.sendComment.bind(this);
        this.deleteComment = this.deleteComment.bind(this);
    }

    //function called when user submits to add a new comment
    sendComment(postid, commentText) {
        fetch('/api/v1/comments/?postid=' + postid, 
        { method: 'POST', credentials: 'same-origin', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({text: commentText}) })
        .then((response) => {
            if (!response.ok) throw Error(response.statusText);
            return response.json();
        })
        .then((data) => {
            this.setState( prevState => ({
                comments: prevState.comments.concat(data)
            }));
        })
        .catch((error) => console.log(error));
    }

    deleteComment(commentid, commentUrl){
        // remove the comment from the post state
        this.setState(prevState => ({
            comments: prevState.comments.filter(comment => comment.commentid != commentid)
        }));

        // delete comment from db with api
        fetch(commentUrl, { method: 'DELETE', credentials: 'same-origin' })
        .then((response) => {
            if (!response.ok) throw Error(response.statusText);
        })
        .catch((error) => console.log(error));
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
            <p><a href={ ownerShowUrl }><b>{ owner }</b></a></p>
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
                    lognameOwnsThis = { comment.lognameOwnsThis }
                    text = { comment.text }
                    commentid = {comment.commentid}
                    commentUrl = {comment.url}
                    deleteComment = {this.deleteComment}
                />
            ))}
            <CommentForm postid={ postid } sendComment={this.sendComment} />           
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