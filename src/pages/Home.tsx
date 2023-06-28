import React, { useEffect, useState } from 'react'
import landingimage from '../assets/landingimage.png'
import { fetchRecommendedList, fetchReleasedSongs, fetchSuggestions, getTrackDetails, searchTracks } from '../redux/api/musicApi';
import { useDispatch } from 'react-redux';
import { updateLogin } from '../redux/slice/userAuthSlice';
import Keycloak from 'keycloak-js';
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import '../styles/Home.css'


const responsive = {
    desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: 3,
        slidesToSlide: 3 // Number of slides to scroll when arrow buttons are clicked
    },
    tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: 2,
        slidesToSlide: 2
    },
    mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 1,
        slidesToSlide: 1
    }
};


let initOptions = {
    url: 'http://localhost:8080/',
    realm: 'music-app',
    clientId: 'musicClient',
    onLoad: 'login-required',
    responseType: 'code'
}
const keycloak: any = Keycloak(initOptions);

keycloak.init({ onLoad: initOptions.onLoad, responseType: initOptions.responseType })
    .then((auth: any) => {
        if (!auth) {
            window.location.reload();
        } else {
            const accessToken = keycloak.token;
            localStorage.setItem("AuthData", JSON.stringify(keycloak))
            localStorage.setItem("AccessToken", accessToken)
        }

        setInterval(() => {
            keycloak.updateToken(70)
                .then((refreshed: any) => {
                    if (refreshed) {
                        console.debug('Token refreshed' + refreshed);
                    } else {
                        console.warn('Token not refreshed, valid for '
                            + Math.round(keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000) + ' seconds');
                    }
                })
                .catch(() => {
                    console.error('Failed to refresh token');
                });

        }, 60000);
    })
    .catch(() => {
        console.error("Authentication Failed");
    });

const Home = () => {
    const [query, setQuery] = useState('');
    const [tracks, setTracks] = useState([]);
    const [playlist, setPlaylist] = useState<any>([]);
    const [favorites, setFavorites] = useState<any>([]);
    const [activePage, setActivePage] = useState('home');
    const [suggestions, setSuggestions] = useState([]); // State for auto-suggestions
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [releasedSongs, setReleasedSongs] = useState([]);
    const [recommended, setRecommended] = useState([])

    const handleSearch = async () => {
        const results = await searchTracks(query);
        setTracks(results);

    };
    const addToPlaylist = async (trackId: string) => {
        const trackDetails = await getTrackDetails(trackId);
        if (trackDetails) {
            setPlaylist([...playlist, trackDetails]);
        }
    };
    const addToFavorites = async (trackId: string) => {
        const trackDetails = await getTrackDetails(trackId);
        if (trackDetails) {
            setFavorites([...favorites, trackDetails]);
        }
    };

    const handleCreatePlaylist = () => {
        if (newPlaylistName) {
            const newPlaylist = {
                name: newPlaylistName,
                tracks: []
            };
            setPlaylist([...playlist, newPlaylist]);
            setNewPlaylistName('');
        }
    };

    const dispatch = useDispatch()

    const getAuthData = () => {
        let data = localStorage.getItem("AuthData")
        dispatch(updateLogin(data))
    }

    const getLatestReleasedSongs = async () => {

        const latestSongs = await fetchReleasedSongs()
        setReleasedSongs(latestSongs)
    }

    const getFeaturedSongs = async () => {
        const recommendedSongs = await fetchRecommendedList()
        setRecommended(recommendedSongs)
    }

    useEffect(() => {
        getAuthData()
        getLatestReleasedSongs()
        getFeaturedSongs()
    }, [])


    const renderContent = () => {
        switch (activePage) {
            case 'home':
                return (
                    <>
                        <div className="content d-flex flex-column ">
                            <div className="content">
                                <div className="row">
                                    <div className="col">
                                        <h3 style={{ color: '#333', fontWeight: '600' }}>Released This Week</h3>
                                        <Carousel showDots={true} responsive={responsive}>
                                            {releasedSongs.map((song: any) => (
                                                <div className="card" key={song.key} style={{ width: '20rem', padding: 15, overflow: 'hidden' }}>
                                                    <img className="card-img-top" src={song.images.background} alt={song.title} />
                                                    <div>
                                                        <a target='_blank' href={song.url}>
                                                            <h2>{song.title}</h2>
                                                            <p className="price">{song.subtitle}</p>
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </Carousel>
                                    </div>
                                </div>
                            </div>

                            <div className="content">
                                <div className="row">
                                    <div className="col">
                                        <h3 style={{ color: '#333', fontWeight: '600' }}>Featured Playlist</h3>
                                        <Carousel showDots={true} responsive={responsive}>
                                            {recommended.map((song: any) => (
                                                <div className="card" key={song.key} style={{ width: '20rem', padding: 15, overflow: 'hidden' }}>
                                                    <img className="card-img-top" src={song.images.background} alt={song.title} />
                                                    <div className="card-body">
                                                        <a target='_blank' href={song.url}>
                                                            <h6>{song.title}</h6>
                                                            <p className="card-text">{song.subtitle}</p>
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </Carousel>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 'search':
                return (
                    <>
                        <div className="row height d-flex justify-content-center align-items-center">
                            <div className="col-md-8 mt-4">
                                <div className="search">
                                    <i className="fa fa-search" />
                                    <input type="text" className="form-control" placeholder="Search for music"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)} />
                                    <button className="btn btn-primary" onClick={handleSearch}>Search</button>
                                </div>
                            </div>

                            <ul className="list-group mt-2">
                                {tracks.map((track: any) => (
                                    <li className="list-group-item" key={track.id}>
                                        <div className="track-info">
                                            <div className="card-body">
                                                <h5 className="card-title">{track.title}</h5>
                                                <p className="card-text">{track.artists}</p>
                                            </div>
                                            <div className="button-group">
                                                <button
                                                    className="btn btn-secondary ms-2 playlistButton"
                                                    onClick={() => addToPlaylist(track.id)}
                                                >
                                                    Add to Playlist &nbsp;
                                                    <i className="fa fa-list" />
                                                </button>
                                                <button
                                                    className="btn btn-secondary ms-2 favoriteButton"
                                                    onClick={() => addToFavorites(track.id)}
                                                >
                                                    Add to Favorites &nbsp;
                                                    <i className="fa fa-heart" />
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                );
            case 'favorites':
                return (
                    <>
                        <h2>Favorites</h2>
                        <ul className="list-group mt-2">
                            {favorites.map((track: any) => (
                                <li className="list-group-item" key={track.key}>
                                    {track.title}
                                    <button
                                        className="btn btn-primary ms-2 favoriteButton"
                                        disabled>
                                        <i className="fa fa-star" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </>
                );
            case 'playlists':
                return (
                    <>
                        <h2>Playlists</h2>

                        <div className="row height d-flex justify-content-center align-items-center mx-2">
                            <div className="col-md-8">
                                <div className="search">

                                    <input type="text" className="form-control"
                                        placeholder="New Playlist Name"
                                        onChange={(e) => setNewPlaylistName(e.target.value)} />
                                    <button className="btn btn-primary" style={{ width: "150px" }} onClick={handleCreatePlaylist}>Create Playlist</button>
                                </div>
                            </div>

                        </div>

                        <ul className="list-group mt-2">
                            {playlist.map((playlistItem: any) => (
                                <li className="list-group-item" key={playlistItem.name}>

                                    <div className="card-body">
                                        <h5 className="card-title">{playlistItem.title}</h5>
                                        <p className="card-text"> {playlistItem.subtitle}</p>
                                    </div>

                                </li>
                            ))}
                        </ul>
                    </>
                );
            default:
                return null;
        }
    };


    return (
        <>
            <div>

                <a className="s-sidebar__trigger" href="#0">
                    <i className="fa fa-bars" />
                </a>
                <div className="s-layout__sidebar">

                    <nav className="s-sidebar__nav">
                        <ul>
                            <li>
                                <a className="s-sidebar__nav-link" onClick={() => setActivePage('home')}>
                                    <i className="fa fa-home" />
                                    <em>Home</em>
                                </a>

                            </li>
                            <li>
                                <a className="s-sidebar__nav-link" onClick={() => setActivePage('search')}>
                                    <i className="fa fa-search" />
                                    <em>Search</em>
                                </a>
                            </li>
                            <li>
                                <a className="s-sidebar__nav-link" onClick={() => setActivePage('favorites')}>
                                    <i className="fa fa-heart" />
                                    <em>Favourites</em>
                                </a>
                            </li>
                            <li>
                                <a className="s-sidebar__nav-link" onClick={() => setActivePage('playlists')}>
                                    <i className="fa fa-list" />
                                    <em>Playlist</em>
                                </a>
                            </li>
                        </ul>
                    </nav>

                </div >

                {/* main  */}
                <div className="mainBox">
                    {/* navBar */}
                    <div className="log-in-bar d-flex justify-content-between align-items-center">
                        <img src={landingimage} style={{ width: '250px', height: '250px' }} />
                        <div style={{ color: "#333" }}>
                            <h1 style={{ fontSize: "42px", fontFamily: "Roboto", fontWeight: "600" }}>Your favorite tunes</h1>
                            <h1 style={{ fontSize: "32px", fontFamily: "Nunito" }}>All <i className="fa fa-sun-o"></i> and all <i className='fa fa-moon-o' /></h1>
                        </div>
                    </div>
                    {renderContent()}
                </div>
            </div>
        </>
    )
}

export default Home
export { keycloak };