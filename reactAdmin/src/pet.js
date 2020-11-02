import * as React from "react";
import { List, Edit, Create, Datagrid, TextField, ReferenceField, EditButton, SimpleForm, TextInput, NumberInput, DateInput, RadioButtonGroupInput, SelectInput, SelectField, ReferenceInput, Filter } from 'react-admin';

const PetSpecies = [
    { id: 'Dog', name: 'Dog' },
    { id: 'Cat', name: 'Cat' },
    { id: 'Guinea Pig', name: 'Guinea Pig' },
    { id: 'Rabbit', name: 'Rabbit' },
    { id: 'Chicken', name: 'Chicken' },
    { id: 'Duck', name: 'Duck' },
    { id: 'Bird', name: 'Bird' },
    { id: 'Horse', name: 'Horse' },
];

const PetGenders = [
    { id: 'Male', name: 'Male' },
    { id: 'Female', name: 'Female' },
    { id: 'Unknown', name: 'Unknown' },
];

const SearchFilter = (props) => (
    <Filter {...props}>
        <TextInput label="Search Name" source="name_like" alwaysOn />
        {/* <TextInput label="Search Species" source="species" /> */}
        <SelectInput source="species" choices={PetSpecies} />
        <SelectInput source="gender" choices={PetGenders} />
        <ReferenceInput label="User" source="userId" reference="users" allowEmpty>
            <SelectInput optionText="name" />
        </ReferenceInput>
    </Filter>
);

export const PetList = props => (
    <List filters={<SearchFilter />}  {...props}>
        <Datagrid>
            <TextField source="name" />
            <SelectField source="species" choices={PetSpecies} />
            <TextField source="age" />
            <SelectField source="gender" choices={PetGenders} />
            <TextField source="priority" />
            <ReferenceField source="userId" reference="users">
                <TextField source="name" />
            </ReferenceField>
            <EditButton />
        </Datagrid>
    </List>
);


export const PetCreate = props => (
    <Create {...props}>
        <SimpleForm redirect="list">
            <TextInput source="name" />
            <SelectInput source="species" choices={PetSpecies} />
            <NumberInput source="age" />
            {/* <SelectInput source="gender" choices={PetGenders} /> */}
            <RadioButtonGroupInput source="gender" choices={PetGenders} optionText="name" optionValue="id" />
            <TextInput multiline source="detail" />
            <NumberInput source="priority" />
            <ReferenceInput source="userId" reference="users">
                <SelectInput optionText="name" />
            </ReferenceInput>
            <DateInput source="updatedAt" />
        </SimpleForm>
    </Create>
);


const EditTitle = ({ record }) => {
    return <span>Edit {record ? `"${record.name}"` : ''}</span>;
};

export const PetEdit = props => (
    <Edit title={<EditTitle />} {...props}>
        <SimpleForm redirect="list">
            <TextInput source="name" />
            <SelectInput source="species" choices={PetSpecies} />
            <NumberInput source="age" />
            <RadioButtonGroupInput source="gender" choices={PetGenders} optionText="name" optionValue="id" />
            <NumberInput source="priority" />
            <TextInput disabled source="id" />
            <TextInput multiline source="detail" />
            <ReferenceInput source="userId" reference="users">
                <SelectInput optionText="name" />
            </ReferenceInput>
            <DateInput source="updatedAt" />
        </SimpleForm>
    </Edit>
);
