import React from 'react';
import PropTypes from 'prop-types';

class LikeUnlikeButton extends React.Component{
    constructor(props) {
        super(props);
        this.handleButtonClick = this.handleButtonClick.bind(this);
    }

    handleButtonClick() {
        this.props.handleButtonClick();
    }

    render(){        
        const { lognameLikesThis } = this.props;

        return (
        <button onClick={this.handleButtonClick} 
                className="like-unlike-button">
            { lognameLikesThis ? 'unlike' : 'like' }
        </button>
        );
    }
}

class PostPhoto extends React.Component{    
    constructor(props) {
        super(props);
        this.handleDoubleClick = this.handleDoubleClick.bind(this);
    }
    
    handleDoubleClick() {
        this.props.handleDoubleClick();
    }

    render(){
        const {imgUrl} = this.props;

        return ( <img src={ imgUrl }  
            onDoubleClick={this.handleDoubleClick} 
            alt={ imgUrl } />);
    }
}

class PhotoAndLikes extends React.Component{
    
    constructor(props) {
        super(props);
        this.state = {numLikes: this.props.numLikes, likeUrl: this.props.likeUrl,
            lognameLikesThis: this.props.lognameLikesThis };
        this.handleButtonClick = this.handleButtonClick.bind(this);
        this.handleDoubleClick = this.handleDoubleClick.bind(this);
        this.handleLike = this.handleLike.bind(this);
        this.handleUnlike = this.handleUnlike.bind(this);
    }

    // update state when props change
    //componentDidUpdate(prevProps) {
      //  if (prevProps !== this.props) {
        //    this.setState({
           //     numLikes: this.props.numLikes, 
             //   likeUrl: this.props.likeUrl,
               // lognameLikesThis: this.props.lognameLikesThis
         //   })
       // }
    //}

    // handles the like/unlikes button being pressed
    handleButtonClick(){
        this.state.lognameLikesThis ? this.handleUnlike() : this.handleLike();
    }

    // handles a double click to the phtoto
    handleDoubleClick(){   
        if (!this.state.lognameLikesThis) {
            this.handleLike();
        } 
    }

    // likes the post
    handleLike(){
        // update state
        this.setState(prevState => (
            { lognameLikesThis: true,
              numLikes: prevState.numLikes + 1 }
        ));

        // update db and get new likeurl
        fetch('/api/v1/likes/?postid=' + this.props.postid, 
            { method: 'POST', credentials: 'same-origin' })
        .then((response) => {
            if (!response.ok) throw Error(response.statusText);
            return response.json();
        })
        .then((json) => {
            this.setState( { likeUrl: json.url } );
        })
        .catch((error) => console.log(error));
    }

    // unlikes the post
    handleUnlike(){
        // save a copy of like url
        let url = this.state.likeUrl;
        
        // update state
        this.setState(prevState => (
            { lognameLikesThis: false,
              numLikes: prevState.numLikes - 1,
              likeUrl: null }
        ));

        // update db
        fetch(url, { method: 'DELETE', credentials: 'same-origin' })
        .then((response) => {
            if (!response.ok) throw Error(response.statusText);
        })
        .catch((error) => console.log(error));
    }

    // renders the post photo, the like counts, and the like/unlike button
    render() {
        const { numLikes, lognameLikesThis } = this.state
        const { imgUrl } = this.props

        return (
            <div>
                <PostPhoto 
                imgUrl={ imgUrl }
                handleDoubleClick={ this.handleDoubleClick } />
                <LikeUnlikeButton 
                lognameLikesThis={ lognameLikesThis }
                handleButtonClick={ this.handleButtonClick } />
                <p>{ numLikes } { (numLikes === 1) ? 'like' : 'likes' }</p>
            </div>
        );
    }
}

PhotoAndLikes.propTypes = {
    numLikes: PropTypes.number.isRequired,
    likeUrl: PropTypes.string,
    lognameLikesThis: PropTypes.bool.isRequired,
};
  
export default PhotoAndLikes;