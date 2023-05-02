import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';
import Sound from 'react-native-sound';
import { Slider } from 'react-native-elements';
import { fetchSongs } from '../api/musicApi';
import RNFS from 'react-native-fs';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';

function SongList({ route }) {
  const [songs, setSongs] = useState([]);
  const [sound, setSound] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [seekingValue, setSeekingValue] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [downloadedSongs, setDownloadedSongs] = useState([]);

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
  const playNextSong = useCallback(async () => {
    const nextIndex = (currentIndex + 1) % songs.length;
    await playSong(songs[nextIndex].url);
    setCurrentIndex(nextIndex);
  }, [currentIndex, songs]);

  async function playSong(uri, songName) {
    const baseUrl = 'https://eelasongs.com/';
    const fullUrl = baseUrl + uri;
    const localPath = `${RNFS.ExternalStorageDirectoryPath}/Download/${songName}.mp3`;

    const isLocalFile = await RNFS.exists(localPath);

    const playUri = isLocalFile ? localPath : fullUrl;

    if (sound) {
      sound.release();
    }

    const newSound = new Sound(playUri, null, (error) => {
      if (error) {
        console.log('Failed to load the sound', error);
        return;
      }
      
      setDuration(newSound.getDuration());
      setSound(newSound);
      newSound.play((success) => {
        if (success) {
          console.log('Successfully finished playing');
          playNextSong();
        } else {
          console.log('Playback failed due to audio decoding errors');
        }
      });

      newSound.setNumberOfLoops(0);
      newSound.getCurrentTime((seconds) => setCurrentTime(seconds));
    });
  }
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
  const renderItem = ({ item, index }) => (
    <ListItem bottomDivider onPress={() => playSong(item.url, item.name)}>
    <ListItem.Content>
      <ListItem.Title>{item.name}</ListItem.Title>
    </ListItem.Content>
    <ListItem.Chevron />
    {!downloadedSongs.includes(item.name) && (
      <TouchableOpacity onPress={() => downloadSong(item.url, item.name)}>
        <Text>Download</Text>
      </TouchableOpacity>
    )}
    {downloadedSongs.includes(item.name) && (
      <Text style={styles.downloadedLabel}>Downloaded</Text>
    )}
  </ListItem>
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
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  playerControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  controlButton: {
    padding: 8,
    backgroundColor: '#1DB954',
    borderRadius: 8,
  },
  sliderContainer: {
    marginTop: 20,
  },
  downloadedLabel: {
    color: 'green',
    fontWeight: 'bold',
  },
});

export default SongList;