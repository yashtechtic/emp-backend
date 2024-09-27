import { DataSource } from 'typeorm';
import DynamicForm from '../static-data/DynamicForm';
import FieldValue from '../static-data/FieldValue';
import FormField from '../static-data/FormField';

// Map entity names to their corresponding seed data
const seedDataMap = {
  DynamicForm,
  FieldValue,
  FormField,
};

export async function seedDatabase(dataSource: DataSource): Promise<void> {
  const entities = dataSource.entityMetadatas;

  for (const entity of entities) {
    const entityName = entity.name;

    if (Object.keys(seedDataMap).includes(entityName)) {
      try {
        const data = seedDataMap[entityName];
        if (!data) {
          console.error(
            `No data to seed for ${entityName}. Check the export in the seed file.`
          );
          continue; // Skip to the next iteration if no data is imported
        }
        const repository = dataSource.getRepository(entityName);
        await repository.save(data.default || data);
      } catch (error) {
        console.error(`Error seeding ${entityName}:`, error);
      }
    }
  }
}
