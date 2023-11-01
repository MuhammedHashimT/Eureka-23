export const fieldsValidator = (fields: string[], allowedRelations: string[]) => {
  fields = fields.filter(field => {
    if (field.includes('.')) {
      const lastIndex = field.lastIndexOf('.');
      const relation = field.slice(0, lastIndex);
      if (field.includes('__typename')) {
        return false;
      } else if (allowedRelations.includes(relation)) {
        return true;
      } else {
        return false;
      }
    } else if (field === '__typename') {
      return false;
    } else {
      return true;
    }
  });

  return fields;
};

export const fieldsIdChecker = (fields: string[]) => {
  // change the fields to the correct format
  // if there have a field relation eg: candidates.candidateProgrammes.programme and no have any field on the relation or field before it , the id will be added to the field as 'id' if it is not relation and 'relation.id' if it is relation
  // eg: candidates.candidateProgrammes.programme will be candidates.candidateProgrammes.id
  // eg: candidates.name will be id
  // eg: candidates.candidateProgrammes.programme.name will be candidates.candidateProgrammes.id
  // eg: candidates.category.name will be candidates.id
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (field.includes('.') && field.split('.').length > 1) {

      // if there no have id on the fields , add the id to the fields

      if(!fields.includes(`${field.split('.')[0]}.id`)) {
        fields.push(`${field.split('.')[0]}.id`);
      }

      
      if (field.split('.').length > 2) {
        const LastRelation = field.slice(0, field.lastIndexOf('.'));
        const SecLastRelation = LastRelation.slice(0, LastRelation.lastIndexOf('.'));
        if (!fields.includes(`${SecLastRelation}.id`)) {
          fields.push(`${SecLastRelation}.id`);
        }
      }
     
      
    }

     
    if (!fields.includes('id')) {
      fields.push(`id`);
    }
  }
  
  return fields;
};

export const isDateValid = (input: any): boolean => {
  const timestamp = input.getTime();
  return !isNaN(timestamp);
}
