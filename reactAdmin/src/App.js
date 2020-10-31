import * as React from "react";
import { Admin, Resource, EditGuesser, CreateGuesser } from 'react-admin';
import { UserList, UserEdit, UserCreate } from './user';
import jsonServerProvider from 'ra-data-json-server';
import PostIcon from '@material-ui/icons/Book';
import UserIcon from '@material-ui/icons/Group';
import { PetList, PetEdit, PetCreate } from "./pet";
import { StoryList, StoryEdit, StoryCreate } from "./story";

const dataProvider = jsonServerProvider('http://localhost:8080/api');

// const dataProvider = jsonServerProvider('https://jsonplaceholder.typicode.com');

const App = () => (
  <Admin dataProvider={dataProvider} >
    <Resource name="user" list={UserList} edit={UserEdit} create={UserCreate} icon={UserIcon} />
    <Resource name="pet" list={PetList} edit={PetEdit} create={PetCreate} icon={PostIcon} />
    <Resource name="story" list={StoryList} edit={StoryEdit} create={StoryCreate} />
  </Admin >
);
export default App;
