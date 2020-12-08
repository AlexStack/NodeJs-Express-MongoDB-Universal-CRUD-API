import * as React from "react";
import { List, Edit, Create, Datagrid, TextField, ReferenceField, EditButton, SimpleForm, TextInput, NumberInput, DateInput, RadioButtonGroupInput, SelectInput, SelectField, ReferenceInput, Filter } from 'react-admin';

const SpeciesSpecies = [
    { id: 'Dog', name: 'Dog' },
    { id: 'Cat', name: 'Cat' },
    { id: 'Guinea Pig', name: 'Guinea Pig' },
    { id: 'Rabbit', name: 'Rabbit' },
    { id: 'Chicken', name: 'Chicken' },
    { id: 'Duck', name: 'Duck' },
    { id: 'Bird', name: 'Bird' },
    { id: 'Horse', name: 'Horse' },
];

const SpeciesGenders = [
    { id: 'Male', name: 'Male' },
    { id: 'Female', name: 'Female' },
    { id: 'Unknown', name: 'Unknown' },
];

const SearchFilter = (props) => (
    <Filter {...props}>
        <TextInput label="Search Name" source="name_like" alwaysOn />
        {/* <TextInput label="Search Species" source="species" /> */}
        <SelectInput source="species" choices={SpeciesSpecies} />
        <SelectInput source="gender" choices={SpeciesGenders} />
        <ReferenceInput label="User" source="userId" reference="users" allowEmpty>
            <SelectInput optionText="firstName" />
        </ReferenceInput>
    </Filter>
);

export const SpeciesList = props => (
    <List filters={<SearchFilter />}  {...props}>
        <Datagrid>
            <TextField source="name" />
            {/* <SelectField source="species" choices={SpeciesSpecies} /> */}
            {/* <TextField source="age" /> */}
            {/* <SelectField source="gender" choices={SpeciesGenders} /> */}
            <TextField source="priority" />
            <TextField source="mainImageUrl" />
            <EditButton />
        </Datagrid>
    </List>
);


export const SpeciesCreate = props => (
    <Create {...props}>
        <SimpleForm redirect="list">
            <TextInput source="name" />
            {/* <SelectInput source="species" choices={SpeciesSpecies} />
            <NumberInput source="age" /> */}
            {/* <SelectInput source="gender" choices={SpeciesGenders} /> */}
            {/* <RadioButtonGroupInput source="gender" choices={SpeciesGenders} optionText="name" optionValue="id" /> */}
            <TextInput multiline source="content" />
            <NumberInput source="priority" />
            <TextInput source="mainImageUrl" />
            <TextInput source="youtubeUrl" />
            {/* <ReferenceInput source="userId" reference="users">
                <SelectInput optionText="name" />
            </ReferenceInput> */}
            <DateInput source="updatedAt" />
        </SimpleForm>
    </Create>
);


const EditTitle = ({ record }) => {
    return <span>Edit {record ? `"${record.name}"` : ''}</span>;
};

export const SpeciesEdit = props => (
    <Edit title={<EditTitle />} {...props}>
        <SimpleForm redirect="list">
            <TextInput source="name" />
            {/* <SelectInput source="species" choices={SpeciesSpecies} /> */}
            {/* <NumberInput source="age" /> */}
            {/* <RadioButtonGroupInput source="gender" choices={SpeciesGenders} optionText="name" optionValue="id" /> */}
            <NumberInput source="priority" />
            {/* <TextInput disabled source="id" /> */}
            <TextInput multiline source="content" />
            <TextInput source="mainImageUrl" />
            <TextInput source="youtubeUrl" />
            {/* <ReferenceInput source="userId" reference="users">
                <SelectInput optionText="name" />
            </ReferenceInput> */}
            <DateInput source="updatedAt" />
        </SimpleForm>
    </Edit>
);
