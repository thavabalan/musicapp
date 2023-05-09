// src/api/musicApi.js
const API_BASE_URL = 'https://eelasongs.com';

export async function fetchGenres() {
  try {
    const response = await fetch(`${API_BASE_URL}/secure/genres`);
    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchAlbumsByGenre(genreId, page = 1) {
  try {
    const response = await fetch(`${API_BASE_URL}/secure/genres/${genreId}/?page=${page}`);
    const json = await response.json();
    
    return json;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchSongs(albumId) {
  try {
    const response = await fetch(`${API_BASE_URL}/secure/artists/${albumId}`);
    const json = await response.json();
    console.log(json.albums.data)
    return json;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const fetchSearchResults = async (query) => {
  try {
    const response = await fetch(`https://eelasongs.com/secure/search?limit=3&modelTypes=App%5CArtist,App%5CTrack&query=${query}`);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.log('Error fetching search results:', error);
  }
};