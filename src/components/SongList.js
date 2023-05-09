import React, { useEffect, useState, useCallback,useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet,ActivityIndicator } from 'react-native';
import { ListItem } from 'react-native-elements';
import Sound from 'react-native-sound';
import { Slider } from 'react-native-elements';
import { fetchSongs } from '../api/musicApi';
import RNFS from 'react-native-fs';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { usePlayer } from '../context/PlayerContext';
import { Header } from 'react-native-elements';


function SongList({ route }) {
  const [seekingValue, setSeekingValue] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState({});

  const { currentSong,currentTime,setCurrentTime, setCurrentSong,duration, isPlaying, setIsPlaying, playNextSong, playPreviousSong,songs,setSongs,sound,setSound,playSong,currentIndex,setCurrentIndex,downloadedSongs,setDownloadedSongs,addSongsToQueue } = usePlayer();




  const { albumId, albumName } = route.params;

  useEffect(() => {
    async function fetchData() {
      console.log(albumId)
      const data = await fetchSongs(albumId);
      if (data) {
        
        setSongs(data.albums.data[0].tracks);
      }
    }
    fetchData();
  }, [albumId]);
  useEffect(() => {
    loadDownloadedSongs();
  }, []);

  
 
  async function downloadSong(song) {
    try {
      const granted = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
      if (granted === RESULTS.GRANTED) {
        const baseUrl = 'https://eelasongs.com/';
        const fullUrl = baseUrl + song.url;
        const downloadPath = `${RNFS.ExternalStorageDirectoryPath}/Download/${song.name}.mp3`;
        const options = {
          fromUrl: fullUrl,
          toFile: downloadPath,
          progressDivider: 50,
          background: true,
          progress: (res) => {
            const percentage = (res.bytesWritten / res.contentLength) * 100;
            setDownloadProgress((prev) => ({ ...prev, [song.name]: percentage }));
          },
        };
  
        const download = await RNFS.downloadFile(options);
  
        download.promise
          .then(async (res) => {
            console.log('Song downloaded:', downloadPath);
            const newDownloadedSong = {
              name: song.name,
              url: song.url,
              album_name: song.album_name,
              image: song.image,
              duration: song.duration,
            };
            const newDownloadedSongs = [...downloadedSongs, newDownloadedSong];
            setDownloadedSongs(newDownloadedSongs);
  
            try {
              await AsyncStorage.setItem('@downloaded_songs', JSON.stringify(newDownloadedSongs));
            } catch (error) {
              console.log('Error saving downloaded songs:', error);
            }
          })
          .catch((err) => {
            console.log('Error downloading song:', err);
          });
      } else {
        const result = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
        if (result === RESULTS.GRANTED) {
          downloadSong(song);
        } else {
          console.log('Permission denied');
        }
      }
    } catch (error) {
      console.log('Error:', error);
    }
  }
  
  async function loadDownloadedSongs() {
    try {
      const value = await AsyncStorage.getItem('@downloaded_songs');
      if (value !== null) {
        setDownloadedSongs(JSON.parse(value));
      }
    } catch (error) {
      console.log('Error loading downloaded songs:', error);
    }
  }
  


  
  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => {
        setCurrentIndex(index);
        playSong(item);
        addSongsToQueue(songs.slice(index + 1));
      }}
    >
      <View>
        <Text style={styles.songName}> {item.name.length > 25 ? item.name.substring(0, 25) + '...' : item.name}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {!downloadedSongs.some((s) => s.name === item.name) && (
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => downloadSong(item)}
          >
            {downloadProgress[item.name] ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <FontAwesome name="download" size={24} color="white" />
            )}
          </TouchableOpacity>
        )}
        {downloadedSongs.some((s) => s.name === item.name) && (
            <FontAwesome name="check" size={24} color="#1DB954" />
        )}
      </View>
    </TouchableOpacity>
  );
  

  return (
    <View style={styles.container}>
          <Header
        centerComponent={{
          text: albumName,
          style: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
        }}
        containerStyle={{
          backgroundColor: '#1DB954',
          justifyContent: 'space-around',
        }}
      />
      {songs.length === 0 ? (
        <Text>No songs found.</Text>
      ) : (
        <FlatList
          data={songs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
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
    textAlign: 'center',
    marginVertical: 16,
    color: 'white',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  songName: {
    fontSize: 18,
    color: 'white',
  },
  artistName: {
    fontSize: 14,
    color: '#b3b3b3',
  },
  downloadButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  downloadedLabel: {
    color: '#1DB954',
    fontWeight: 'bold',
  },
  playbackControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#282828',
  },
});


export default SongList;