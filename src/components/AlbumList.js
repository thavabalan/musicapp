// components/AlbumList.js
import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet,Text, } from 'react-native';
import { ListItem, Avatar } from 'react-native-elements';
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
  const renderItem = ({ item }) => (
    <ListItem bottomDivider onPress={() => navigation.navigate('SongList', { albumId: item.id, albumName: item.name })}>
      <Avatar source={{ uri: item.image }} />
      <ListItem.Content>
        <ListItem.Title>{item.name}</ListItem.Title>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>
  );
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
          extraData={albums}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
});

export default AlbumList;