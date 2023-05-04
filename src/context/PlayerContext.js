import React, { createContext, useContext, useState,useCallback } from 'react';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
const PlayerContext = createContext();

export function usePlayer() {
  return useContext(PlayerContext);
}

export function PlayerProvider({ children }) {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
const [currentIndex, setCurrentIndex] = useState(-1);
const [songs, setSongs] = useState([]);
const [downloadedSongs, setDownloadedSongs] = useState([]);
const [duration, setDuration] = useState(0);
const [currentTime, setCurrentTime] = useState(0);

const playNextSong = useCallback(async () => {
  const nextIndex = (currentIndex + 1) % songs.length;
  const nextSong = songs[nextIndex];
  setCurrentIndex(nextIndex);

  if (downloadedSongs.includes(nextSong.name)) {
    const downloadPath = `${RNFS.ExternalStorageDirectoryPath}/Download/${nextSong.name}.mp3`;
    await playSong(downloadPath, nextSong.name);
  } else {
    await playSong(nextSong.url,nextSong.name);
  }
}, [currentIndex, songs, downloadedSongs]);
const playPreviousSong = useCallback(async () => {
  const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
  const prevSong = songs[prevIndex];
  setCurrentIndex(prevIndex);

  if (downloadedSongs.includes(prevSong.name)) {
    const downloadPath = `${RNFS.ExternalStorageDirectoryPath}/Download/${prevSong.name}.mp3`;
    await playSong(downloadPath, prevSong.name);
  } else {
    await playSong(prevSong.url, prevSong.name);
  }
}, [currentIndex, songs, downloadedSongs]);

async function playSong(uri, songName) {
  const baseUrl = 'https://eelasongs.com/';
  const fullUrl = baseUrl + uri;
  const localPath = `${RNFS.ExternalStorageDirectoryPath}/Download/${songName}.mp3`;

  const isLocalFile = await RNFS.exists(localPath);

  const playUri = isLocalFile ? localPath : fullUrl;
 
  setCurrentSong(songName);
  setIsPlaying(true);
  if (sound) {
    sound.release();
    setIsPlaying(true);
    
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
const value = {
  currentSong,
  setCurrentSong,
  isPlaying,
  setIsPlaying,
  playNextSong,
  playPreviousSong,
  setSongs,
  songs,
  downloadedSongs,
  setDownloadedSongs,
  sound,
  setSound,
  playSong,
  duration,
  setDuration
  
};

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
