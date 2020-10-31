import * as React from "react";
import { List, Edit, Create, Datagrid, TextField, ReferenceField, EditButton, SimpleForm, TextInput, NumberInput, DateInput, RadioButtonGroupInput, SelectInput, SelectField, ReferenceInput, BooleanInput, useDataProvider } from 'react-admin';

const PublicOrPrivate = [
    { id: true, name: 'Public' },
    { id: false, name: 'Private' }
];
export const StoryList = props => (
    <List {...props}>
        <Datagrid>
            <TextField source="title" />
            <SelectField source="public" choices={PublicOrPrivate} />
            <TextField source="priority" />
            <ReferenceField source="petId" reference="pet">
                <TextField source="name" />
            </ReferenceField>
            <ReferenceField source="userId" reference="user">
                <TextField source="name" />
            </ReferenceField>
            <EditButton />
        </Datagrid>
    </List>
);


export const StoryCreate = props => {
    const dataProvider = useDataProvider();
    const transform = async data => {
        let pet;
        await dataProvider
            .getOne('pet', { id: data.petId })
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
        <Create {...props} transform={transform}>
            <SimpleForm redirect="list">
                <TextInput source="title" />
                <RadioButtonGroupInput source="public" choices={PublicOrPrivate} optionText="name" optionValue="id" />
                <TextInput multiline source="content" />
                <NumberInput source="priority" />
                <ReferenceInput source="petId" reference="pet">
                    <SelectInput optionText="name" />
                </ReferenceInput>
                {/* <ReferenceInput source="userId" reference="user">
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


export const StoryEdit = (props) => {
    const dataProvider = useDataProvider();
    const transform = async data => {
        let pet;
        await dataProvider
            .getOne('pet', { id: data.petId })
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
        <Edit title={<EditTitle />} {...props} transform={transform}>
            <SimpleForm redirect="list">
                <TextInput source="title" />
                {/* <RadioButtonGroupInput source="public" choices={PublicOrPrivate} optionText="name" optionValue="id" /> */}
                <BooleanInput source="public" />
                <TextInput multiline source="content" />
                <NumberInput source="priority" />
                <ReferenceInput source="petId" reference="pet">
                    <SelectInput optionText="name" />
                </ReferenceInput>
                {/* <ReferenceInput source="userId" reference="user">
                    <SelectInput optionText="name" />
                </ReferenceInput> */}
                <DateInput source="updatedAt" />
            </SimpleForm>
        </Edit>
    )
};
