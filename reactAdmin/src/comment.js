import * as React from "react";
import { List, Edit, Create, Datagrid, TextField, ReferenceField, EditButton, SimpleForm, TextInput, NumberInput, DateInput, RadioButtonGroupInput, SelectInput, SelectField, ReferenceInput, BooleanInput, useDataProvider } from 'react-admin';

const PublicOrPrivate = [
    { id: true, name: 'Public' },
    { id: false, name: 'Private' }
];
export const CommentList = props => (
    <List {...props}>
        <Datagrid>
            <TextField source="title" />
            {/* <SelectField source="public" choices={PublicOrPrivate} /> */}
            <TextField source="priority" />
            <TextField source="category" />
            <ReferenceField source="petId" reference="pets">
                <TextField source="name" />
            </ReferenceField>
            <ReferenceField source="storyId" reference="stories">
                <TextField source="title" />
            </ReferenceField>
            <ReferenceField source="userId" reference="users">
                <TextField source="firstName" />
            </ReferenceField>
            <EditButton />
        </Datagrid>
    </List>
);


export const CommentCreate = props => {
    const dataProvider = useDataProvider();
    const transform = async data => {
        let pet;
        await dataProvider
            .getOne('comments', { id: data.petId })
            .then(response => {
                pet = response.data;
            });
        // console.log('transform-data:', data, pet);
        return ({
            ...data,
            userId: `${pet.userId}`
        })
    };

    return (
        <Create {...props} >
            <SimpleForm redirect="list">
                <TextInput source="title" />
                <TextInput source="category" />
                {/* <RadioButtonGroupInput source="public" choices={PublicOrPrivate} optionText="name" optionValue="id" /> */}
                <TextInput multiline source="content" />
                <NumberInput source="priority" />
                <ReferenceInput source="petId" reference="pets">
                    <SelectInput optionText="name" />
                </ReferenceInput>
                {/* <ReferenceInput source="userId" reference="users">
                <SelectInput optionText="name" />
            </ReferenceInput> */}
                <DateInput source="updatedAt" />
            </SimpleForm>
        </Create>
    )
};


const EditTitle = ({ record }) => {
    return <span>Edit {record ? `"${record.title}"` : ''}</span>;
};


export const CommentEdit = (props) => {
    const dataProvider = useDataProvider();
    const transform = async data => {
        let pet;
        await dataProvider
            .getOne('pets', { id: data.petId })
            .then(response => {
                pet = response.data;
            });
        // console.log('transform-data:', data, pet);
        return ({
            ...data,
            userId: `${pet.userId}`
        })
    };

    return (
        <Edit title={<EditTitle />} {...props} >
            <SimpleForm redirect="list">
                <TextInput source="title" />
                {/* <RadioButtonGroupInput source="public" choices={PublicOrPrivate} optionText="name" optionValue="id" /> */}
                {/* <BooleanInput source="public" /> */}
                <TextInput source="category" />
                <TextInput multiline source="content" />
                <NumberInput source="priority" />
                <ReferenceInput source="petId" reference="pets">
                    <SelectInput optionText="name" />
                </ReferenceInput>
                <TextInput source="storyId" />
                <TextInput source="ownerId" />
                <TextInput source="userId" />
                {/* <ReferenceInput source="userId" reference="users">
                    <SelectInput optionText="name" />
                </ReferenceInput> */}
                <DateInput source="updatedAt" />
            </SimpleForm>
        </Edit>
    )
};
