// components/GenreList.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { fetchGenres } from '../api/musicApi';

function GenreList({ navigation }) {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await fetchGenres();
      if (data) {
        setGenres(data.pagination.data);
      }
    }
    fetchData();
  }, []);

  return (
    <View>
      <Text>Genres:</Text>
      {genres.length === 0 ? (
        <Text>No genres found.</Text>
      ) : (
        genres.map((genre) => (
          <TouchableOpacity
            key={genre.id}
            onPress={() => navigation.navigate('AlbumList', { genreId: genre.name })}
          >
            <Text>{genre.display_name}</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

export default GenreList;
