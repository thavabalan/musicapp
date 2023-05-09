import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Header } from 'react-native-elements';

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

  const numColumns = 2;
  const screenWidth = Dimensions.get('window').width;
  const tileSize = screenWidth / numColumns;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.tile}
      onPress={() => navigation.navigate('AlbumList', { genreId: item.name })}
    >
      <Image source={{ uri: item.image }} style={styles.genreImage} />
      <Text style={styles.genreName}>{item.display_name}</Text>
    </TouchableOpacity>
  );
  GenreList.navigationOptions = {
    headerShown: false,
  };
  return (
    <View style={styles.container}>
        <Header
        centerComponent={{
          text: 'முகப்பு',
          style: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
        }}
        containerStyle={{
          backgroundColor: '#1DB954',
          justifyContent: 'space-around',
        }}
      />
      {genres.length === 0 ? (
        <Text>No genres found.</Text>
      ) : (
        <FlatList
          data={genres}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.genreList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    padding: 10,
  },
  genreList: {
    paddingHorizontal: 10,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    borderRadius: 8,
    backgroundColor: '#1e1e1e',
    padding: 15,
  },
  genreImage: {
    width: '100%',
    height: 100,
    borderRadius: 4,
  },
  genreName: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
  },
});

export default GenreList;
