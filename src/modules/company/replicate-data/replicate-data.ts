import { City } from '@app/modules/city/entities/city.entity';
import { Country } from '@app/modules/country/entities/country.entity';
import { Settings } from '@app/modules/settings/entities/setting.entity';
import { State } from '@app/modules/state/entities/state.entity';
import { DataSource, Repository } from 'typeorm';

export async function replicateData(
  targetDataSource: DataSource,
  countryRepository: Repository<Country>,
  stateRepository: Repository<State>,
  cityRepository: Repository<City>,
  settingsRepository: Repository<Settings>
) {
  try {
    // Initialize target data source if not already initialized
    if (!targetDataSource.isInitialized) await targetDataSource.initialize();

    // Start transaction
    const queryRunner = targetDataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      // Read data from source
      const [countries, states, cities, settings] = await Promise.all([
        countryRepository.find(),
        stateRepository.find(),
        cityRepository.find(),
        settingsRepository.find(),
      ]);

      // Bulk insert data into target
      await queryRunner.manager
        .getRepository(Country)
        .save(countries, { chunk: 100 });
      await queryRunner.manager
        .getRepository(State)
        .save(states, { chunk: 100 });
      await queryRunner.manager
        .getRepository(City)
        .save(cities, { chunk: 100 });
      await queryRunner.manager
        .getRepository(Settings)
        .save(settings, { chunk: 100 });

      // Commit transaction
      await queryRunner.commitTransaction();

      console.log('Data replication completed successfully.');
    } catch (err) {
      // Rollback transaction in case of error
      await queryRunner.rollbackTransaction();
      console.error('Data replication failed:', err);
    } finally {
      // Release query runner which is manually instantiated
      await queryRunner.release();
    }
  } catch (err) {
    console.error(
      'Failed to initialize target data source or transaction:',
      err
    );
  }
}
