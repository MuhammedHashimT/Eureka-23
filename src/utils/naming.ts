import { NamingStrategyInterface, DefaultNamingStrategy } from 'typeorm';

export class CamelNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
  columnName(propertyName: string, customName: string, embeddedPrefixes: string[]): string {
    return customName ? customName : propertyName;
  }

  tableName(targetName: string, userSpecifiedName: string): string {
    return userSpecifiedName ? userSpecifiedName : targetName.charAt(0).toLowerCase() + targetName.slice(1);
  }

  relationName(propertyName: string): string {
    return propertyName.charAt(0).toLowerCase() + propertyName.slice(1);
  }
}
