import TrackPlayer from 'react-native-track-player';

module.exports = async function () {
  TrackPlayer.addEventListener('remote-play', () => {
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener('remote-pause', () => {
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener('remote-stop', () => {
    TrackPlayer.stop();
  });

  TrackPlayer.addEventListener('remote-next', async () => {
    await TrackPlayer.skipToNext();
  });

  TrackPlayer.addEventListener('remote-previous', async () => {
    await TrackPlayer.skipToPrevious();
  });

  TrackPlayer.addEventListener('remote-seek', async (position) => {
    await TrackPlayer.seekTo(position);
  });
};