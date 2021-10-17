import React from 'react';
import PropTypes from 'prop-types';

class DeleteCommentButton extends React.Component{    
    constructor(props) {
        super(props);
        this.handleButtonClick = this.handleButtonClick.bind(this);
    }
    
    // delete comment when the button is pressed
    handleButtonClick(){
        this.props.deleteComment(this.props.commentid, this.props.commentUrl);
    }
    
    render(){
        return(
        <button onClick={this.handleButtonClick} className="delete-comment-button">
            Delete comment
        </button>
        )
    }
}

class Comment extends React.Component{
    render(){
        const { owner, ownerUrl, lognameOwnsThis, text, commentid, commentUrl} = this.props

        return (
            <div>
                <a href={ ownerUrl }><b>{ owner }</b></a> { text } 
                { lognameOwnsThis ? 
                <DeleteCommentButton commentid={commentid} 
                commentUrl={commentUrl} deleteComment={this.props.deleteComment} /> : <p></p> }
            </div>
        )
    }
}

class CommentForm extends React.Component{
    constructor(props) {
        super(props);
        this.state = {commentText: ''};
    
        this.handleChange = this.handleChange.bind(this);
        this.pressEnter = this.pressEnter.bind(this);
    }
    
    //function called when user types in text field
    handleChange(event) {
        this.setState({commentText: event.target.value});
    }

    //function called when enter pressed
    pressEnter(event) {
        if (event.keyCode === 13) {  
            event.preventDefault();                      
            this.props.sendComment(this.props.postid, this.state.commentText);
            this.setState({commentText: ''});
        }
    }

    render(){
        return (
            <div>
                <form className="comment-form" >
                    <input type="text" value={this.state.commentText} onChange={this.handleChange} 
                    onKeyPress={this.pressEnter} />
                </form>
            </div>
        )
    }
}

Comment.propTypes = {
    owner: PropTypes.string.isRequired,
    ownerUrl: PropTypes.string.isRequired,
    lognameOwnsThis: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired,
    commentid: PropTypes.number.isRequired,
    commentUrl: PropTypes.string.isRequired
};

DeleteCommentButton.propTypes = {
    commentid: PropTypes.number.isRequired,
    commentUrl: PropTypes.string.isRequired
};

CommentForm.propTypes = {
    postid: PropTypes.number.isRequired
};

export { CommentForm, Comment };