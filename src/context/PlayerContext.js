import React, { createContext, useContext, useState,useCallback } from 'react';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
import MusicControl from 'react-native-music-control';
import TrackPlayer from 'react-native-track-player';
import { useProgress,Capability } from 'react-native-track-player';

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
const [currentTime, setCurrentTime] = useState(0);
const { position, duration } = useProgress();
React.useEffect(() => {
  const setupPlayer = async () => {
    await TrackPlayer.setupPlayer();
    TrackPlayer.updateOptions({
      stopWithApp: true,
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
        Capability.SeekTo
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo
      ],
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo
      ],
      progressBar: {
        interval: 1000, // Update progress bar every 1 second (1000 ms)
      },
    });
    TrackPlayer.addEventListener('playback-error', (error) => {
      console.log('Playback Error:', error);
    });

    TrackPlayer.addEventListener('playback-metadata-received', (metadata) => {
      console.log('Playback Metadata Received:', metadata);
    });
  };

  setupPlayer();
}, []);

async function playNextSong(){


   try {
  await TrackPlayer.skipToNext();
  const currentTrackId = await TrackPlayer.getCurrentTrack();
  const track = await TrackPlayer.getTrack(currentTrackId);
  const songName = track.title;
  setCurrentSong(track);

  
} catch (error) {
  console.error("There's no next track in the queue:", error);
}}
async function playPreviousSong(){


  try {
    await TrackPlayer.skipToPrevious();
} catch (error) {
 console.error("There's no next track in the queue:", error);
}}

async function addSongsToQueue(songsToAdd) {
  console.log(songsToAdd)
  const baseUrl = 'https://eelasongs.com/';
  const tracks = await Promise.all(songsToAdd.map(async (song) => {
    const fullUrl = baseUrl + song.url;
    const localPath = `${RNFS.ExternalStorageDirectoryPath}/Download/${song.name}.mp3`;
    const isLocalFile = await RNFS.exists(localPath);
    const playUri = isLocalFile ? localPath : fullUrl;
    const imageUrl = baseUrl + song.image;
    const songduration = song.duration / 1000;

    return {
      id: song.name,
      url: playUri,
      title: song.name,
      artist: song.album_name,
      artwork: imageUrl,
      duration: songduration,
    };
  }));

  await TrackPlayer.reset();
  await TrackPlayer.add(tracks);
}


async function playSong(song) {
  console.log('Song URL:', song.url);
  const baseUrl = 'https://eelasongs.com/';
  const fullUrl = baseUrl + song.url;
  const localPath = `${RNFS.ExternalStorageDirectoryPath}/Download/${song.name}.mp3`;

  let isLocalFile = false;
  try {
    const fileStat = await RNFS.stat(localPath);
    isLocalFile = fileStat.isFile();
    console.log('Local file found:', localPath);
  } catch (error) {
    console.log('Error checking local file:', error);
  }

  const playUri = isLocalFile ? localPath : fullUrl;
  console.log('Play URI:', playUri);

  const imageUrl = baseUrl + song.image;
  const songduration = song.duration / 1000;
  const track = {
    id: song.name, // Must be a unique ID
    url: playUri,
    title: song.name,
    artist: song.album_name,
    artwork: imageUrl,
    duration: songduration,
  };



  await TrackPlayer.reset();
  await TrackPlayer.add(track);
  await TrackPlayer.play();

  setCurrentSong(track);
  setIsPlaying(true);
  };
  async function pauseSong() {
    await TrackPlayer.pause();
    setIsPlaying(false);
  }
  async function resumeSong() {
    await TrackPlayer.play();
    setIsPlaying(true);
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
  currentTime,
  setCurrentTime,
  currentSong,
  position,
  pauseSong,
  resumeSong,
  setCurrentIndex,
  addSongsToQueue

  
};

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
