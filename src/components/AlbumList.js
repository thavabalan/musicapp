// components/AlbumList.js
import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Image, Dimensions,ActivityIndicator } from 'react-native';
import { Text, Header } from 'react-native-elements';
import { fetchAlbumsByGenre } from '../api/musicApi';

function AlbumList({ navigation, route }) {
  const [albums, setAlbums] = useState([]);
  const { genreId } = route.params;
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  async function fetchData() {
    setLoading(true);
    const data = await fetchAlbumsByGenre(genreId, page);
    if (data) {
      setAlbums((prevAlbums) => [...prevAlbums, ...data.artists.data]);
      if (data.artists.total === albums.length + data.artists.data.length) {
        setHasMore(false);
      }
  
      setLoading(false);
     
    }
  }

  useEffect(() => {
    fetchData();
  }, [genreId, page]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const numColumns = 2;
  const screenWidth = Dimensions.get('window').width;
  const tileSize = screenWidth / numColumns;

  const renderFooter = () => {
     if (!loading || !hasMore) return null;
  
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  };
  
  const renderItem = ({ item }) => {
    const imageUrl = 'https://eelasongs.com/' + item.image;
    return (
      <TouchableOpacity
        style={styles.tile} // Use the "tile" style from GenreList
        onPress={() => navigation.navigate('SongList', { albumId: item.id, albumName: item.name })}
      >
        <Image source={{ uri: imageUrl }} style={styles.albumImage} />
        <Text style={styles.albumName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        centerComponent={{
          text: 'Albums',
          style: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
        }}
        containerStyle={{
          backgroundColor: '#1DB954',
          justifyContent: 'space-around',
        }}
      />
      {albums.length === 0 ? (
        <Text>No albums found.</Text>
      ) : (
        <FlatList
          data={albums}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.albumList}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={1}
        />
      )}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
        </View>
      )}
    </View>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  albumList: {
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
  albumImage: {
    width: '100%',
    height: 100,
    borderRadius: 4,
  },
  albumName: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
  },
  footerLoading: {
    marginTop: 10,
    marginBottom: 10,
  },
});

export default AlbumList;
