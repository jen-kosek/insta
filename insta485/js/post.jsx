import React from 'react';
import PropTypes from 'prop-types';
import photo_and_likes from './buttons';

class Post extends React.Component {
    /* Display number of image and post owner of a single post
    */

    constructor(props) {
        // Initialize mutable state
        super(props);
        this.state = { comments: '', imgUrl: '', created: '', likes: '', owner: '',
            ownerImgUrl: '', ownerShowUrl: '', postShowUrl: '', postid: ''};
    }

    componentDidMount() {
        // This line automatically assigns this.props.url to the const variable url
        const { url } = this.props;

        // Call REST API to get the post's information
        fetch(url, { credentials: 'same-origin' })
        .then((response) => {
            if (!response.ok) throw Error(response.statusText);
            return response.json();
        })
        .then((data) => {
            this.setState({
                comments: data.comments,
                imgUrl: data.imgUrl,
                created: data.created,
                likes: data.likes,
                owner: data.owner,
                ownerImgUrl: data.ownerImgUrl,
                ownerShowUrl: data.ownerShowUrl,
                postShowUrl: data.postShowUrl,
                postid: data.postid
            });
        })
        .catch((error) => console.log(error));
    }

    // returns list of comments
    getComments(){
        return comments.map((comment) => {
            <comment commentinfo = { comment } />
        })
    }

    render() {
        // This line automatically assigns this.state.imgUrl to the const variable imgUrl
        // and this.state.owner to the const variable owner
        const { imgUrl, owner, ownerImgUrl, postid, 
            ownerShowUrl, postShowUrl, created } = this.state;

        // Render number of post image and post owner
        return (
        <div className="post">
            <img src={ ownerImgUrl } alt={ ownerImgUrl }></img>
            <a href={ ownerShowUrl }><b>{ owner }</b></a>
            <p><a href={ postShowUrl }> { created } </a></p>
            <photo_and_likes likes = { this.state.likes } 
                postid = { postid } imgUrl = { imgUrl } />
            {this.getComments}
            <comment_form />
        </div>
        );
    }
}

Post.propTypes = {
  url: PropTypes.string.isRequired,
};

export default Post;