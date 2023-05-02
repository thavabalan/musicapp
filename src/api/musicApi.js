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

export async function fetchAlbumsByGenre(genreId) {
  try {
    const response = await fetch(`${API_BASE_URL}/secure/genres/${genreId}/`);
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
