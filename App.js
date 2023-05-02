// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import GenreList from './src/components/GenreList';
import AlbumList from './src/components/AlbumList';
import SongList from './src/components/SongList';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="GenreList">
        <Stack.Screen name="GenreList" component={GenreList} />
        <Stack.Screen name="AlbumList" component={AlbumList} />
        <Stack.Screen name="SongList" component={SongList} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
