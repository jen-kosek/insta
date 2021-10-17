import React from 'react';
import PropTypes from 'prop-types';

class DeleteCommentButton extends React.Component{    
    // delete comment when the button is pressed
    handleButtonClick(event){
        fetch(likeUrl, { method: 'DELETE', credentials: 'same-origin' })
        .then((response) => {
            if (!response.ok) throw Error(response.statusText);
            else this.setState( {likeUrl: null} )
        })
        .catch((error) => console.log(error));

        //prevents website from refreshing
        event.preventDefault();
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
        const { owner, ownerUrl, lognameOwnsThis, text } = this.props

        return (
            <div>
                <p><a href={ ownerUrl }><b>{ owner }</b></a>{ text }
                { lognameOwnsThis ? <DeleteCommentButton/> : <p></p> }
                </p>
            </div>
        )
    }
}

class CommentForm extends React.Component{
    constructor(props) {
        super(props);
        this.state = {commentText: ''};
    
        this.changeState = this.changeState.bind(this);
        this.sendComment = this.sendComment.bind(this);
    }
    
    //calls parent to send comment
    sendComment() {
        this.props.sendComment(this.state.commentText)
    }

    //function called when user types in text field
    changeState(event) {
        this.setState({commentText: event.target.value});
    }

    //function called when enter pressed
    pressEnter(event) {
        if (event.keyCode === 'Enter') {
            event.sendComment();
        }

        //prevents website from refreshing
        event.preventDefault();
    }

    render(){
        return (
            <div>
                <form className="comment-form" type="text" 
                onKeyPress={this.pressEnter}>
                    <input type="text" value="" onChange={this.changeState}
                    value={this.state.value}/>
                </form>
            </div>
        )
    }
}

Comment.propTypes = {
    owner: PropTypes.string.isRequired,
    ownerUrl: PropTypes.string.isRequired,
    lognameOwnsThis: PropTypes.bool,
    text: PropTypes.string.isRequired,
};

export { CommentForm, Comment };