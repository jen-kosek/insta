import React from 'react';

class like_unlike_button extends React.Component{
    handleButtonClick() {
        this.props.handleButtonClick();
    }

    render(){  
        const {lognameLikesThis} = this.props
        
        return (
        <button onClick={this.handleButtonClick} 
                className="like-unlike-button">
            { this.props.lognameLikesThis ? 'like' : 'unlike' }
        </button>
        )
    }
}

class post_photo extends React.Component{    
    handleDoubleClick() {
        this.props.handleDoubleClick();
    }

    render(){
        return ( <img src={ this.props.imgUrl }  
            onDoubleClick={this.handleDoubleClick} 
            alt={ this.props.imgUrl }></img>)
    }
}

class photo_and_likes extends React.Component{
    
    constructor(props) {
        super(props);
        this.state = {numlikes: props.likes.numLikes, like_url: props.likes.url,
            lognameLikesThis: props.likes.lognameLikesThis, postid: props.postid, imgUrl: props.imgUrl };
    
        this.handleButtonClick = this.handleButtonClick.bind(this);
        this.handleLike = this.handleLike.bind(this);
        this.handleUnlike = this.handleUnlike.bind(this);
    }

    // handles the like/unlikes button being pressed
    updateButtonClick(){
        if (prevState.lognameLikesThis) this.handleLike();
        else this.handleUnlike();

        this.setState(prevState => ({
            lognameLikesThis: !prevState.lognameLikesThis
        }));
    }

    // handles a double click to the phtoto
    handleDoubleClick(){
        if(!prevState.lognameLikesThis) this.handleLike();
    }

    // likes the post
    handleLike(){
        fetch('/api/v1/likes/?postid=' + this.state.postid, { credentials: 'same-origin' })
        .then((response) => {
            if (!response.ok) throw Error(response.statusText);
            else this.setState(prevState => ({
                numlikes: ++prevState.lognameLikesThis
            }));
        })
        .catch((error) => console.log(error));
    }

    // unlikes the post
    handleUnlike(){
        fetch('/api/v1/likes/<{' + likeid + '}>/', { credentials: 'same-origin' })
        .then((response) => {
            if (!response.ok) throw Error(response.statusText);
            else this.setState(prevState => ({
                numlikes: --prevState.lognameLikesThis
            }));
        })
        .catch((error) => console.log(error));
    }

    // renders the post photo, the like counts, and the like/unlike button
    render() {
        let like_or_likes = "likes"
        if (this.state.numlikes == 1) like_or_likes = "likes"
        return (
          <div>
            <post_photo 
            imgUrl={this.state.imgUrl}
            handleDoubleClick={this.handleButtonClick} />
            <p>{this.state.numLikes} {like_or_likes}</p>
            <like_unlike_button 
            lognameLikesThis={this.state.lognameLikesThis}
            handleButtonClick={this.handleButtonClick} />
          </div>
        );
    }
}


class delete_comment_button extends React.Component{    
    // function called when the button is pressed
    handleButtonClick(event){
        this.props.handleButtonClick();
    }
    
    render(){
        return(
        <button onClick={this.handleButtonClick} className="delete-comment-button">
            Delete comment
        </button>
        )
    }
}