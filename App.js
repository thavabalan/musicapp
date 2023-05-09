import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import GenreList from './src/components/GenreList';
import AlbumList from './src/components/AlbumList';
import SongList from './src/components/SongList';
import LibraryScreen from './src/components/LibraryScreen';
import SearchScreen from './src/components/SearchScreen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { PlayerProvider } from './src/context/PlayerContext';
import BottomPlayerBar from './src/components/Player';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (

    <Stack.Navigator initialRouteName="GenreList" screenOptions={{
      headerShown: false,
    }}>

      <Stack.Screen name="GenreList" component={GenreList} />
      <Stack.Screen name="AlbumList" component={AlbumList} />
      <Stack.Screen name="SongList" component={SongList} />

    </Stack.Navigator>

  );
}

function App() {
  return (
    <PlayerProvider>

    <NavigationContainer>
      <View style={{ flex: 1 }}>
      <Tab.Navigator
          initialRouteName="Home"
          screenOptions={{
            activeTintColor: '#1DB954',
            inactiveTintColor: 'black',
            style: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)', // Add this line
              borderTopColor: 'rgba(255, 255, 255, 0.1)', // Add this line
            },
            headerShown: false
          }}
          barStyle={{ backgroundColor: '#ffff' }}
        >
        <Tab.Screen name="Home" component={HomeStack} options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" color={color} size={26} />
          ),
        }}/>
        <Tab.Screen name="Library" component={LibraryScreen} options={{
          tabBarLabel: 'Library',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="download" color={color} size={26} />
          ),
        }}/>
        <Tab.Screen name="Search" component={SearchScreen} options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="card-search" color={color} size={26} />
          ),
        }}/>
      </Tab.Navigator>
      <BottomPlayerBar />

      </View>
    </NavigationContainer>
    </PlayerProvider>
  );
}

export default App;
