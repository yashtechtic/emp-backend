import { DataSource } from 'typeorm';

export async function addGetMillisecondsFunction(
  connection: DataSource
): Promise<void> {
  const query = `
    CREATE DEFINER=\`root\`@\`localhost\` FUNCTION \`getMilliseconds\`(\`value\` DATETIME) RETURNS bigint
        NO SQL
        DETERMINISTIC
    return IF(ISNULL(value), value, (UNIX_TIMESTAMP(value) * 1000));
  `;
  await connection.query(query);
}
