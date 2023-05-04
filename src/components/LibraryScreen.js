import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePlayer } from '../context/PlayerContext';

const LibraryScreen = () => {
  const { currentSong, setCurrentSong,duration, isPlaying, setIsPlaying, playNextSong, playPreviousSong,songs,setSongs,sound,setSound,playSong,currentIndex,setCurrentIndex,downloadedSongs,setDownloadedSongs } = usePlayer();


  useEffect(() => {
    loadDownloadedSongs();
  }, []);

  async function loadDownloadedSongs() {
    try {
      const value = await AsyncStorage.getItem('@downloaded_songs');
      if (value !== null) {
        console.log(JSON.parse(value))
        setDownloadedSongs(JSON.parse(value));
      }
    } catch (error) {
      console.log('Error loading downloaded songs:', error);
    }
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => playSong(item.url, item)}
    >
      <Text style={styles.songName}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Library:</Text>
      {downloadedSongs.length === 0 ? (
        <Text>No songs in your library.</Text>
      ) : (
        <FlatList
          data={downloadedSongs}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </View>
  );
};

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
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#444',
    borderBottomWidth: 1,
    padding: 15,
  },
  songName: {
    fontSize: 18,
    color: '#fff',
  },
});

export default LibraryScreen;
