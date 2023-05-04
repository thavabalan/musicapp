import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { usePlayer } from '../context/PlayerContext';

export default function BottomPlayerBar() {
  const { currentSong, isPlaying, playSong, playNextSong, playPreviousSong } = usePlayer();

  if (!currentSong) {
    return null;
  }

  return (
    <View style={styles.bottomBar}>
      <View style={styles.leftSection}>
        <View>
          <Text style={styles.songName}>{currentSong}</Text>
          <Text style={styles.artistName}>{currentSong}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={playPreviousSong}>
          <FontAwesome name="step-backward" size={24} color="white" />
        </TouchableOpacity>
        {isPlaying ? (
          <TouchableOpacity onPress={playSong} style={styles.playButton}>
            <FontAwesome name="pause" size={24} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={playSong} style={styles.playButton}>
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
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#282828',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
