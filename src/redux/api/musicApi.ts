import axios from 'axios';
import moment from 'moment';

const API_KEY = '5865282e00msh47d93f0beb6dd68p1e3d80jsn86a1044814a6';

export const searchTracks = async (query: string) => {
    try {
        const response = await axios.get('https://shazam.p.rapidapi.com/search', {
            params: { term: query },
            headers: {
                'x-rapidapi-host': 'shazam.p.rapidapi.com',
                'x-rapidapi-key': API_KEY,
            },
        });
        const simplifiedTracks = response.data.tracks.hits.map((hit: any) => ({
            id: hit.track.key,
            title: hit.track.title,
            artists: hit.track.subtitle,
        }));
        return simplifiedTracks;
    } catch (error) {
        console.error('Error searching tracks:', error);
        return [];
    }
};

export const getTrackDetails = async (trackId: string) => {
    try {
        const response = await axios.get(`https://shazam.p.rapidapi.com/songs/get-details`, {
            params: { key: trackId },
            headers: {
                'x-rapidapi-host': 'shazam.p.rapidapi.com',
                'x-rapidapi-key': API_KEY,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error retrieving track details:', error);
        return null;
    }
};

export const fetchSuggestions = (searchTerm: any) => {
    const options = {
        method: 'GET',
        url: 'https://apidojo-shazam-v1.p.rapidapi.com/auto-complete',
        params: { term: searchTerm },
        headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': 'apidojo-shazam-v1.p.rapidapi.com',
        },
    };

    return axios.request(options)
        .then((response) => response.data)
        .catch((error) => {
            console.error('Error fetching suggestions:', error);
            throw error;
        });
};


export const fetchReleasedSongs = async () => {
    try {
        const startDate = moment().startOf('week').format('YYYY-MM-DD');
        const endDate = moment().endOf('week').format('YYYY-MM-DD');

        const response = await axios.get(
            'https://shazam.p.rapidapi.com/charts/track',
            {
                headers: {
                    'x-rapidapi-host': 'shazam.p.rapidapi.com',
                    'x-rapidapi-key': API_KEY,
                },
                params: {
                    locale: 'en-US',
                    pageSize: 10,
                    from: startDate,
                    to: endDate,
                },
            }
        );
        return response.data.tracks;
    } catch (error) {
        console.error('Error fetching released songs:', error);
    }
}


export const fetchRecommendedList = async () => {
    try {
        const response = await axios.get(
            'https://shazam.p.rapidapi.com/songs/list-recommendations',
            {
                params: {
                    key: '484129036',
                    locale: 'en-US'
                },
                headers: {
                    'x-rapidapi-host': 'shazam.p.rapidapi.com',
                    'x-rapidapi-key': API_KEY,
                },

            }
        );

        return response.data.tracks;
    } catch (error) {
        console.error('Error fetching featured songs:', error);
    }
}
