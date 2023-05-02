// components/AlbumList.js
import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text } from 'react-native-elements';
import { fetchAlbumsByGenre } from '../api/musicApi';

function AlbumList({ navigation,route }) {
  const [albums, setAlbums] = useState([]);
  const { genreId } = route.params;

  useEffect(() => {
    async function fetchData() {
      const data = await fetchAlbumsByGenre(genreId);
      if (data) {
        setAlbums(data.artists.data);
      }
    }
    fetchData();
  }, [genreId]);
  const renderItem = ({ item }) => {
    
    const imageUrl = 'https://eelasongs.com/' + item.image;
    return (
      <TouchableOpacity
        style={[styles.albumContainer, styles.itemWrapper]} // Add the itemWrapper style
        onPress={() => navigation.navigate('SongList', { albumId: item.id, albumName: item.name })}
      >
        <Image source={{ uri: imageUrl }} style={styles.albumImage} />
        <Text style={styles.albumName}>{item.name}</Text>
      </TouchableOpacity>
    );};
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Albums:</Text>
        {albums.length === 0 ? (
          <Text>No albums found.</Text>
        ) : (
          <FlatList
            data={albums}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.albumList}
          />
        )}
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 10,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginVertical: 10,
    },
    albumList: {
      justifyContent: 'space-between',
    },
    albumContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 10,
      marginHorizontal: 5, // Add margin to the sides
    },
    albumImage: {
      width: '100%',
      height: 150,
      resizeMode: 'cover',
      borderRadius: 10,
    },
    albumName: {
      marginTop: 5,
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    itemWrapper: {
      flex: 1,
      aspectRatio: 1, // Ensure equal height for every column
    },
  });
  export default AlbumList;