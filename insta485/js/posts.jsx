import React from 'react';
import PropTypes from 'prop-types';
import Post from './post';

class Posts extends React.Component {
    constructor(props) {
        // Initialize mutable state
        super(props);
        this.state = { postsInfo: [] };
    }

    componentDidMount() {
        // This line automatically assigns this.props.url to the const variable url
        const { url } = this.props;

        // Call REST API to get the all the postid on the page
        fetch(url, { credentials: 'same-origin' })
        .then((response) => {
            if (!response.ok) throw Error(response.statusText);
            return response.json();
        })
        .then((data) => {
            this.setState({postsInfo: data['results']})
        })
        .catch((error) => console.log(error));
    }

    render(){
        const {postsInfo} = this.state;
        
        // make a post component for each postUrl
        let posts = postsInfo.map(post => (
        <Post key={ post.postid } 
              url={ post.url } 
              comments={ post.comments }
              created={ post.created }
              imgUrl={ post.imgUrl }
              created={ post.created }
              numLikes={ post.likes.numLikes }
              lognameLikesThis={ post.likes.lognameLikesThis }
              likeUrl={ post.likes.url } 
              owner={ post.owner }
              ownerImgUrl={ post.ownerImgUrl }
              ownerShowUrl={ post.ownerShowUrl } 
              postShowUrl={ post.postShowUrl } 
              postid={ post.postid }/>));

        return (
            <div className="posts"> 
                { posts }
            </div>
        );
    }
}

Posts.propTypes = {
    url: PropTypes.string.isRequired,
};
  
export default Posts;