import * as React from "react";
import { List, Edit, Create, Datagrid, TextField, ReferenceField, EditButton, SimpleForm, TextInput, NumberInput, DateInput, RadioButtonGroupInput, SelectInput, SelectField, ReferenceInput, BooleanInput } from 'react-admin';

const StorySpecies = [
    { id: 'Dog', name: 'Dog' },
    { id: 'Cat', name: 'Cat' },
    { id: 'Guinea Pig', name: 'Guinea Pig' },
    { id: 'Rabbit', name: 'Rabbit' },
    { id: 'Chicken', name: 'Chicken' },
    { id: 'Duck', name: 'Duck' },
    { id: 'Bird', name: 'Bird' },
    { id: 'Horse', name: 'Horse' },
];

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


export const StoryCreate = props => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="title" />
            <RadioButtonGroupInput source="public" choices={PublicOrPrivate} optionText="name" optionValue="id" />
            <TextInput multiline source="content" />
            <NumberInput source="priority" />
            <ReferenceInput source="petId" reference="pet">
                <SelectInput optionText="name" />
            </ReferenceInput>
            <ReferenceInput source="userId" reference="user">
                <SelectInput optionText="name" />
            </ReferenceInput>
            <DateInput source="updatedAt" />
        </SimpleForm>
    </Create>
);


const EditTitle = ({ record }) => {
    return <span>Edit {record ? `"${record.title}"` : ''}</span>;
};

export const StoryEdit = props => {
    const transform = data => {
        console.log('transform-data:', data);
        return ({
            ...data,
            userId: `${data.userId}`
        })
    };

    return (
        <Edit title={<EditTitle />} {...props} transform={transform}>
            <SimpleForm>
                <TextInput source="title" />
                {/* <RadioButtonGroupInput source="public" choices={PublicOrPrivate} optionText="name" optionValue="id" /> */}
                <BooleanInput source="public" />
                <TextInput multiline source="content" />
                <NumberInput source="priority" />
                <ReferenceInput source="petId" reference="pet">
                    <SelectInput optionText="name" />
                </ReferenceInput>
                <ReferenceInput source="userId" reference="user">
                    <SelectInput optionText="name" />
                </ReferenceInput>
                <DateInput source="updatedAt" />
            </SimpleForm>
        </Edit>
    )
};
