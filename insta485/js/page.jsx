import React from 'react';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import Post from './post';

class Page extends React.Component {
    constructor(props) {
        // Initialize mutable state
        super(props);
        this.state = { url: this.props.url, postsInfo: [], next: '' };
        this.fetchNextPage = this.fetchNextPage.bind(this);
    }

    componentDidMount() {
        // This line automatically assigns this.props.url to the const variable url
        const { url } = this.props;

        // Load history if arrived by back button
        if (String(window.performance.getEntriesByType("navigation")[0].type) === "back_forward"){
            window.history.back();
            this.setState({
                url: window.history.state.url,
                postsInfo: window.history.state.postsInfo,
                next: window.history.state.next
            });
        }

        // Otherwise call REST API to get the all the posts info and next page url
        else {
            fetch(url, { credentials: 'same-origin' })
            .then((response) => {
                if (!response.ok) throw Error(response.statusText);
                return response.json();
            })
            .then((data) => {
                this.setState({postsInfo: data['results'], next: data['next']})
            })
            // Add state to history
            .then(() => {
                window.history.pushState(this.state, "page", "/");
            })
            .catch((error) => console.log(error));
        }
    }

    fetchNextPage() {
        const { next } = this.state;

        // Call REST API to get the all the postid on the page
        fetch(next, { credentials: 'same-origin' })
        .then((response) => {
            if (!response.ok) throw Error(response.statusText);
            return response.json();
        })
        .then((data) => {
            this.setState( (prevState) => ({
                postsInfo: prevState.postsInfo.concat(data['results']), 
                next: data['next'],
                url: data['url']
            }))
        })
        // Edit history
        .then(() => {
            window.history.replaceState(this.state, "index", '/');
        })
        .catch((error) => console.log(error));
    }

    render(){        
        return (
            <div className="page"> 
                <InfiniteScroll
                    dataLength={ this.state.postsInfo.length } //This is important field to render the next data
                    next={ this.fetchNextPage }
                    hasMore={ (this.state.next !== "") }
                    loader={<h4>Loading...</h4>}
                    endMessage={
                        <p style={{ textAlign: 'center' }}>
                        <b>No more posts</b>
                        </p>
                    }
                    >
                    { this.state.postsInfo.map(post => (
                        <Post key={ post.postid } 
                            url={ post.url } 
                            comments={ post.comments }
                            created={ post.created }
                            imgUrl={ post.imgUrl }
                            owner={ post.owner }
                            ownerImgUrl={ post.ownerImgUrl }
                            ownerShowUrl={ post.ownerShowUrl } 
                            postShowUrl={ post.postShowUrl } 
                            postid={ post.postid }
                            numLikes={ post.likes.numLikes }
                            lognameLikesThis={ post.likes.lognameLikesThis }
                            likeUrl={ post.likes.url } 
                        />
                    ))}
                </InfiniteScroll>
            </div>
        );
    }
}

Page.propTypes = {
    url: PropTypes.string.isRequired,
};
  
export default Page;