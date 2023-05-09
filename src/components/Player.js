import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import TrackPlayer from 'react-native-track-player';
import { usePlayer } from '../context/PlayerContext';

export default function BottomPlayerBar() {
  const {
    currentSong,
    isPlaying,
    playNextSong,
    playPreviousSong,
    pauseSong,
    resumeSong,
  } = usePlayer();

  if (!currentSong) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Image source={{ uri: currentSong.artwork }} style={styles.cover} />
        <View>
          <Text style={styles.songName}>{currentSong.title}</Text>
          <Text style={styles.artistName}>{currentSong.artist}</Text>
        </View>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity onPress={playPreviousSong}>
          <FontAwesome name="step-backward" size={24} color="white" />
        </TouchableOpacity>
        {isPlaying ? (
          <TouchableOpacity onPress={pauseSong} style={styles.playButton}>
            <FontAwesome name="pause" size={24} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={resumeSong} style={styles.playButton}>
            <FontAwesome name="play" size={24} color="white" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={playNextSong}>
          <FontAwesome name="step-forward" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#282828',
    borderTopWidth: 1,
    borderTopColor: '#121212',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cover: {
    width: 40,
    height: 40,
    borderRadius: 2,
    marginRight: 8,
  },
  songName: {
    fontSize: 16,
    color: 'white',
  },
  artistName: {
    fontSize: 14,
    color: '#B3B3B3',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    marginHorizontal: 16,
  },
});
