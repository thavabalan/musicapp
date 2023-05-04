import React, { useEffect, useState, useCallback,useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';
import Sound from 'react-native-sound';
import { Slider } from 'react-native-elements';
import { fetchSongs } from '../api/musicApi';
import RNFS from 'react-native-fs';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { usePlayer } from '../context/PlayerContext';


function SongList({ route }) {
  const [seekingValue, setSeekingValue] = useState(0);
  const [playingSong, setPlayingSong] = useState(null);
  const { currentSong, setCurrentSong,duration, isPlaying, setIsPlaying, playNextSong, playPreviousSong,songs,setSongs,sound,setSound,playSong,currentIndex,setCurrentIndex,downloadedSongs,setDownloadedSongs } = usePlayer();





  const { albumId, albumName } = route.params;

  useEffect(() => {
    async function fetchData() {
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



  const resume = () => {
    return new Promise((resolve, reject) => {
      if (sound) {
        sound.play((success) => {
          if (success) {
            console.log('Resumed successfully');
            setIsPlaying(true);
            resolve();
          } else {
            console.log('Failed to resume');
            reject();
          }
        });
      } else {
        reject();
      }
    });
  };
  
  const pause = () => {
    return new Promise((resolve, reject) => {
      if (sound) {
        sound.pause((success) => {
          if (success) {
            console.log('Paused successfully');
            setIsPlaying(false);
            resolve();
          } else {
            console.log('Failed to pause');
            reject();
          }
        });
      } else {
        reject();
      }
    });
  };
  
  
 
  async function downloadSong(uri, songName) {
    try {
      const granted = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
      if (granted === RESULTS.GRANTED) {
        const baseUrl = 'https://eelasongs.com/';
        const fullUrl = baseUrl + uri;
        const downloadPath = `${RNFS.ExternalStorageDirectoryPath}/Download/${songName}.mp3`;
        const options = {
          fromUrl: fullUrl,
          toFile: downloadPath,
          progressDivider: 50,
          background: true,
        };
        const download = await RNFS.downloadFile(options);
  
        download.promise
          .then(async (res) => {
            console.log('Song downloaded:', downloadPath);
            const newDownloadedSongs = [...downloadedSongs, songName];
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
          downloadSong(uri, songName);
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
  
  async function stopSong() {
    if (sound) {
      sound.stop(() => {
        sound.release();
        setSound(null);
      });
    }
  }

  function onSlidingStart() {
    if (sound) {
      sound.pause();
    }
  }

  function onSlidingComplete(value) {
    if (sound) {
      seek(value);
      sound.play();
    }
  }

  function seek(value) {
    if (sound) {
      const newPosition = value * duration;
      sound.setCurrentTime(newPosition);
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (sound) {
        sound.getCurrentTime((seconds) => {
          setCurrentTime(seconds);
          setSeekingValue(seconds / duration);
        });
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      if (sound) {
        console.log('Releasing Sound');
        sound.release();
      }
    };
  }, [sound, duration]);

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  const PlaybackControls = () => (
    <View style={styles.playbackControls}>
      <TouchableOpacity onPress={playPreviousSong}>
        <FontAwesome name="step-backward" size={24} color="white" />
      </TouchableOpacity>
      {isPlaying ? (
     <TouchableOpacity
     onPress={() => {
       pause().catch((error) => {
         console.log("Error pausing:", error);
       });
     }}
   >
     <FontAwesome name="pause" size={24} color="white" />
   </TouchableOpacity>
    ) : (
      <TouchableOpacity
      onPress={() => {
        if (!playingSong) {
          setCurrentIndex(0);
          playSong(songs[0].url, songs[0].name);
        } else {
          resume().catch((error) => {
            console.log("Error resuming:", error);
          });
        }
      }}
    >
      <FontAwesome name="play" size={24} color="white" />
    </TouchableOpacity>
      
    )}
      <TouchableOpacity onPress={playNextSong}>
        <FontAwesome name="step-forward" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
  
  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => playSong(item.url, item.name)}
    >
      <View>
        <Text style={styles.songName}>{item.name}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {!downloadedSongs.includes(item.name) && (
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => downloadSong(item.url, item.name)}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Download</Text>
          </TouchableOpacity>
        )}
        {downloadedSongs.includes(item.name) && (
          <Text style={styles.downloadedLabel}>Downloaded</Text>
        )}
      </View>
    </TouchableOpacity>
  );
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Songs in {albumName}:</Text>
      {songs.length === 0 ? (
        <Text>No songs found.</Text>
      ) : (
        <FlatList
          data={songs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
      <View style={styles.playerControls}>
        <TouchableOpacity onPress={playNextSong} style={styles.controlButton}>
          <Text>Next</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={stopSong} style={styles.controlButton}>
          <Text>Stop</Text>
        </TouchableOpacity>
      </View>
     
      <View style={styles.sliderContainer}>
      <PlaybackControls />
        <Slider
          value={seekingValue}
          onValueChange={setSeekingValue}
          onSlidingStart={onSlidingStart}
          onSlidingComplete={onSlidingComplete}
          minimumValue={0}
          maximumValue={1}
          step={0.01}
          style={{ width: '100%' }}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text>{formatTime(currentTime)}</Text>
      <Text>{formatTime(duration)}</Text>
        </View>
      </View>
      
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