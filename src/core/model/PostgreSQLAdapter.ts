import { DatabaseAdapter, ColumnDefinition } from './databaseAdapter';
import { Client, Pool, PoolConfig } from 'pg';

export class PostgreSQLAdapter implements DatabaseAdapter {
  private pool: Pool | null = null;

  constructor(private config: PoolConfig) {}

  async connect(): Promise<void> {
    this.pool = new Pool(this.config);
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  async createTable(tableName: string, columns: ColumnDefinition[]): Promise<void> {
    if (!this.pool) {
        throw new Error('Connection pool is not established.');
      }
  
      const columnDefinitions = columns.map((column) => {
        return `${column.name} ${column.type}${column.primaryKey ? ' PRIMARY KEY' : ''} ${column.default ? 'DEFAULT' + column.default : ''}`;
      });
  
      const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions.join(', ')}`;
      
      const client = new Client();
      await client.connect();
      await client.query(createTableSQL);
      await client.end();
  }

  async prepare(sql: string, values: Record<string, any>): Promise<any[]> {
    if (!this.pool) {
      throw new Error('Connection pool is not established.');
    }

    const client = new Client();
    await client.connect();

    const { rows, fields } = await client.query(sql, Object.values(values));

    await client.end();

    if (Array.isArray(rows)) {
      return rows.map((row) => {
        const mappedRow: Record<string, any> = {};
        fields.forEach((field) => {
          mappedRow[field.name] = row[field.name];
        });
        return mappedRow;
      });
    } else if (rows) {
      const mappedRow: Record<string, any> = {};
      fields.forEach((field) => {
        mappedRow[field.name] = rows[field.name];
      });
      return [mappedRow];
    }

    return [];
  }
  
}
