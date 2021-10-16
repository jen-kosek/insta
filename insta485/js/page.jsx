import React from 'react';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import Post from './post';

class Page extends React.Component {
    constructor(props) {
        // Initialize mutable state
        super(props);
        this.state = { postsInfo: [], next: '' };
    }

    componentDidMount() {
        // This line automatically assigns this.props.url to the const variable url
        const { url } = this.props;

        // Call REST API to get the all the posts info and next page url
        fetch(url, { credentials: 'same-origin' })
        .then((response) => {
            if (!response.ok) throw Error(response.statusText);
            return response.json();
        })
        .then((data) => {
            this.setState({postsInfo: data['results'], next: data['next']})
        })
        .catch((error) => console.log(error));
    }

    fetchNextPage() {
        // Call REST API to get the all the postid on the page
        fetch(url, { credentials: 'same-origin' })
        .then((response) => {
            if (!response.ok) throw Error(response.statusText);
            return response.json();
        })
        .then((data) => {
            this.setState( (prevState) => ({
                postsInfo: [...prevState, 
                data['results']], next: data['next']
            }))
        })
        .catch((error) => console.log(error));
    }

    render(){
        const {postsInfo, next } = this.state;
        
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
            <div className="page"> 
                <InfiniteScroll
                    dataLength={ posts.length } //This is important field to render the next data
                    next={ this.fetchNextPage }
                    hasMore={ next !== '' }
                    loader={<h4>Loading...</h4>}
                    endMessage={
                        <p style={{ textAlign: 'center' }}>
                        <b>No more posts</b>
                        </p>
                    }
                    >
                    {posts}
                </InfiniteScroll>
            </div>
        );
    }
}

Page.propTypes = {
    url: PropTypes.string.isRequired,
};
  
export default Page;