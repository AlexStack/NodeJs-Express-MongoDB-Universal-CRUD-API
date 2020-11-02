import * as React from "react";
import { Admin, Resource } from 'react-admin';
import { UserList, UserEdit, UserCreate } from './user';
import jsonServerProvider from 'ra-data-json-server';
import PostIcon from '@material-ui/icons/Book';
import UserIcon from '@material-ui/icons/Group';
import { PetList, PetEdit, PetCreate } from "./pet";
import { StoryList, StoryEdit, StoryCreate } from "./story";

// const dataProvider = jsonServerProvider('http://localhost:8080/api');

const dataProvider = jsonServerProvider(process.env.REACT_APP_MEAN_API || 'http://localhost:8080/api');

const App = () => (
  <Admin dataProvider={dataProvider} >
    <Resource name="users" list={UserList} edit={UserEdit} create={UserCreate} icon={UserIcon} />
    <Resource name="pets" list={PetList} edit={PetEdit} create={PetCreate} icon={PostIcon} />
    <Resource name="stories" list={StoryList} edit={StoryEdit} create={StoryCreate} dataProvider={dataProvider} />
  </Admin >
);
export default App;
