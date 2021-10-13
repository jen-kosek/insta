import React from 'react';
import PropTypes from 'prop-types';
import Post from './post';

class Posts extends React.Component {
    constructor(props) {
        // Initialize mutable state
        super(props);
        this.state = { postUrls: [] };
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
            data['results'].forEach(post => {
                this.setState(prevState => ({
                    postUrls: [...prevState.postUrls, post['url']]
                }));
            })
        })
        .catch((error) => console.log(error));
    }

    get_posts(){
        return <div> {this.state.postUrls.map(postUrl => (<Post url= { postUrl }/>)) } </div>;
    }

    render(){
        const {postUrls} = this.state;

        return (
            <div className="posts"> 
                { postUrls.length ? this.get_posts : <p>no posts</p> }
            </div>
        );
    }
}

Posts.propTypes = {
    url: PropTypes.string.isRequired,
};
  
export default Posts;