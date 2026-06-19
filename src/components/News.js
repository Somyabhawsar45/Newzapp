import React, { useEffect, useState } from 'react';
import Newsitem from './Newsitem';
import Skeleton from './Skeleton';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';

const News = (props) => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [error, setError] = useState(false);

    const capitalizeFirstLetter = (string) =>
        string.charAt(0).toUpperCase() + string.slice(1);

const buildUrl = (pageNum) => {
    if (props.query && props.query.trim() !== '') {
        return `/api/news?q=${encodeURIComponent(props.query)}&page=${pageNum}&pageSize=${props.pageSize}`;
    }
    return `/api/news?country=${props.country}&category=${props.category}&page=${pageNum}&pageSize=${props.pageSize}`;
};
    const updateNews = async () => {
        props.setProgress(10);
        setError(false);
        const url = buildUrl(1);
        setLoading(true);
        try {
            const data = await fetch(url);
            props.setProgress(30);
            const parsedData = await data.json();
            props.setProgress(70);
            if (parsedData.status === 'error' || !parsedData.articles) {
                throw new Error(parsedData.message || 'Failed to fetch news');
            }
            setArticles(parsedData.articles);
            setTotalResults(parsedData.totalResults || 0);
        } catch (err) {
            setError(true);
            setArticles([]);
        } finally {
            setLoading(false);
            props.setProgress(100);
        }
    };

    useEffect(() => {
        document.title = props.query
            ? `Search: ${props.query} - NewsHub`
            : `${capitalizeFirstLetter(props.category)} - NewsHub`;
        setPage(1);
        updateNews();
        // eslint-disable-next-line
    }, [props.query, props.category]);

   const fetchMoreData = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const nextPage = page + 1;
    const url = buildUrl(nextPage);
    setPage(nextPage);
    try {
        const data = await fetch(url);
        const parsedData = await data.json();
        if (parsedData.status === 'error') return;
        
        // Filter out duplicates before adding
        const existingUrls = new Set(articles.map(a => a.url));
        const newArticles = (parsedData.articles || []).filter(a => !existingUrls.has(a.url));
        
        setArticles(prev => [...prev, ...newArticles]);
        setTotalResults(parsedData.totalResults || 0);
    } catch (err) {
        // silently ignore
    }
};

    return (
        <>
           <div className="nh-page-header">
  <p className="nh-eyebrow">{props.query ? 'Search' : capitalizeFirstLetter(props.category)}</p>
  <h1 className="nh-page-title">
    {props.query ? `Results for "${props.query}"` : `Top ${capitalizeFirstLetter(props.category)} headlines`}
  </h1>
</div>

            {loading && <Skeleton count={props.pageSize} />}

            {!loading && error && (
                <div className="empty-state">
                    ⚠️ Something went wrong fetching news. Please try again later.
                </div>
            )}

            {!loading && !error && articles.length === 0 && (
                <div className="empty-state">
                    🔍 No articles found{props.query ? ` for "${props.query}"` : ''}.
                </div>
            )}

            {!loading && !error && articles.length > 0 && (
                <InfiniteScroll
                    dataLength={articles.length}
                    next={fetchMoreData}
                    hasMore={articles.length !== totalResults}
                    loader={<Skeleton count={3} />}
                >
                    <div className="container">
                        <div className="row">
                            {articles.map((element) => (
                                <div className="col-md-4" key={element.url}>
                                    <Newsitem
                                        title={element.title || ''}
                                        description={element.description || ''}
                                        imageUrl={element.urlToImage}
                                        newsUrl={element.url}
                                        author={element.author}
                                        date={element.publishedAt}
                                        source={element.source.name}
                                        article={element}
                                        isSaved={props.savedArticles?.some(a => a.url === element.url)}
                                        onBookmark={props.toggleBookmark}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </InfiniteScroll>
            )}
        </>
    );
};

News.defaultProps = {
    country: 'us',
    pageSize: 8,
    category: 'general',
    query: '',
};

News.propTypes = {
    country: PropTypes.string,
    pageSize: PropTypes.number,
    category: PropTypes.string,
    query: PropTypes.string,
    setProgress: PropTypes.func.isRequired,
    savedArticles: PropTypes.array,
    toggleBookmark: PropTypes.func,
};


export default News;