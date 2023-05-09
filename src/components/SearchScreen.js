import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { fetchSearchResults } from '../api/musicApi'; // Import the function to fetch search results
import { usePlayer } from '../context/PlayerContext';
import { Header } from 'react-native-elements';

const SearchScreen = ( { navigation } ) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState({ artists: [], tracks: [] });
  const { playSong } = usePlayer();

  const searchApi = async (query) => {
    const response = await fetchSearchResults(query);

    setResults(response);
    console.log(response)
  };

  const updateSearch = (search) => {
    setSearch(search);
    searchApi(search);
  };
  const renderItem = ({ item, type }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => {
        if (type === 'album') {
          navigation.navigate('SongList', {
            albumId: item.id,
            albumName: item.name,
          });
        } else if (type === 'song') {
          playSong(item);
          console.log('Playing song:', item.name);
        }
      }}
    >
      {type === 'album' && (
        <Image
          source={{ uri: 'https://eelasongs.com/' + item.image }}
          style={styles.albumImage}
        />
      )}
      <Text style={styles.itemText}>{item.name}</Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
          <Header
        centerComponent={{
          text: 'இங்கே தேடலாம்',
          style: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
        }}
        containerStyle={{
          backgroundColor: '#1DB954',
          justifyContent: 'space-around',
        }}
      />
      <SearchBar
        placeholder="Search for songs and albums..."
        onChangeText={updateSearch}
        value={search}
        lightTheme
        round
      />
      <Text style={styles.sectionTitle}>Songs</Text>
      <FlatList
        data={results.tracks}
        renderItem={({ item }) => renderItem({ item, type: 'song' })}
        keyExtractor={(item) => item.id.toString()}
      />
      <Text style={styles.sectionTitle}>Albums</Text>
      <FlatList
        data={results.artists}
        renderItem={({ item }) => renderItem({ item, type: 'album' })}
        keyExtractor={(item) => item.id.toString()}
        horizontal // Add this line to make the list scrollable horizontally
        showsHorizontalScrollIndicator={false} // Optional: hide the scroll indicator
        contentContainerStyle={styles.albumList} // Add this line to style the album list
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
    alignItems: 'center', // Add this line to center the image and text
  },
  albumImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    borderRadius: 10,
    marginBottom: 5, // Add this line to add some space between the image and text
  },
  itemText: {
    fontSize: 16,
  },
});





export default SearchScreen;
