import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { ListItem } from 'react-native-elements';
import Sound from 'react-native-sound';
import { Slider } from 'react-native-elements';
import { fetchSongs } from '../api/musicApi';

function SongList({ route }) {
  const [songs, setSongs] = useState([]);
  const [sound, setSound] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [seekingValue, setSeekingValue] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
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

  const playNextSong = useCallback(async () => {
    const nextIndex = (currentIndex + 1) % songs.length;
    await playSong(songs[nextIndex].url);
    setCurrentIndex(nextIndex);
  }, [currentIndex, songs]);

  async function playSong(uri) {
    const baseUrl = 'https://eelasongs.com/';
    const fullUrl = baseUrl + uri;
    
    if (sound) {
      sound.release();
    }

    const newSound = new Sound(fullUrl, null, (error) => {
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
    <ListItem bottomDivider onPress={() => playSong(item.url)}>
      <ListItem.Content>
        <ListItem.Title>{item.name}</ListItem.Title>
      </ListItem.Content>
      <ListItem.Chevron />
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
});

export default SongList;