import * as React from "react";
import { List, Edit, Create, Datagrid, TextField, EmailField, EditButton, SimpleForm, TextInput, NumberInput, DateInput, PasswordInput, SelectInput, SelectField } from 'react-admin';

const UserRoles = [
    { id: 'normalUser', name: 'Registered User' },
    { id: 'vipUser', name: 'VIP User' },
    { id: 'webAdmin', name: 'Website Admin' },
];
export const UserList = props => (
    <List {...props}>
        <Datagrid>
            {/* <TextField source="id" /> */}
            <TextField source="name" />
            <TextField source="age" />
            <EmailField source="email" />
            <SelectField source="role" choices={UserRoles} />
            {/* <TextField source="title" />
            <TextField source="description" />
            <TextField source="company.name" /> */}
            <EditButton />
        </Datagrid>
    </List>
);

const EditTitle = ({ record }) => {
    return <span>Edit {record ? `"${record.name}"` : ''}</span>;
};

export const UserEdit = props => (
    <Edit title={<EditTitle />} {...props}>
        <SimpleForm>
            <TextInput source="name" />
            <TextInput source="email" />
            <NumberInput source="age" />
            <SelectInput source="role" label="User Role" choices={UserRoles} />
            <PasswordInput source="password" />
            <TextInput disabled source="id" />
            <DateInput source="updatedAt" />
        </SimpleForm>
    </Edit>
);

export const UserCreate = props => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="name" />
            <TextInput source="email" />
            <NumberInput source="age" />
            <SelectInput source="role" label="User Role" choices={UserRoles} />
            <PasswordInput source="password" />
            <TextInput disabled source="id" />
            <DateInput source="updatedAt" />
        </SimpleForm>
    </Create>
);