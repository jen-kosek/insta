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
    constructor(props) {
        super(props);
        this.state = {owner: this.props.owner, ownerUrl: this.props.ownerUrl,
                        lognameOwnsThis: this.props.lognameOwnsThis, 
                        text: this.props.text};
    }

    render(){
        const { owner, ownerUrl, lognameOwnsThis, text } = this.state

        return (
            <div>
                <p><a href={ ownerUrl }><b>{ owner }</b></a>{ text }
                if ({ owner } === { lognameOwnsThis }) {
                    <DeleteCommentButton/>
                }
                </p>
            </div>
        )
    }
}

export class CommentForm extends React.Component{
    constructor(props) {
        super(props);
        this.state = {commentText: ''};
    
        this.changeState = this.changeState.bind(this);
        this.sendComment = this.sendComment.bind(this);
    }
    
    //function called when user types in text field
    changeState(event) {
        this.setState({commentText: event.target.value});
    }

    //function called when user submits
    sendComment(event) {
        this.setState({commentText: this.state.commentText})

        // MAYBE ADD NEW COMMENT??????
        fetch('/api/v1/comments/', { method: 'POST', credentials: 'same-origin' })
            .then((response) => {
                if (!response.ok) throw Error(response.statusText);
                return response.json();
            })
            .catch((error) => console.log(error));

        //prevents website from refreshing
        event.preventDefault();
    }

    //function called when enter pressed
    pressEnter(event) {
        if (event.keyCode === 'Enter') {
            event.sendComment();
        }
    }

    render(){
        return (
            <div>
                <form className="comment-form" onChange={this.changeState} 
                    onKeyPress={this.pressEnter}>
                    <input type="text" value=""/>
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
};

export default Comment;