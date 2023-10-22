import { DatabaseAdapter, ColumnDefinition } from './databaseAdapter';
import mysql, { RowDataPacket } from 'mysql2/promise';


export class MySQLAdapter implements DatabaseAdapter {
  private connection: mysql.Connection | null = null;

  constructor(private config: mysql.ConnectionConfig) {}

  async connect(): Promise<void> {
    this.connection = await mysql.createPool(this.config);
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }

  async createTable(tableName: string, columns: ColumnDefinition[]): Promise<void> {
    if (!this.connection) {
        throw new Error('Connection is not established.');
      }
  
      const columnDefinitions = columns.map((column) => {
        return `${column.name} ${column.type}${column.primaryKey ? ' PRIMARY KEY' : ''} ${column.default ? 'DEFAULT' + column.default : ''}`;
      });
  
      const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions.join(', ')})`;
      
      await this.connection.query(createTableSQL);
    
  }

  async prepare(sql: string, values: Record<string, any>): Promise<any[]> {
    if (!this.connection) {
      throw new Error('Connection is not established.');
    }

    const [result, fields] = await this.connection.execute(sql, values);

    if (Array.isArray(result)) {
      return result.map((row) => {
        const rowData = row as RowDataPacket;
        const mappedRow: Record<string, any> = {};
        for (const key in rowData) {
          mappedRow[key] = rowData[key];
        }
        return mappedRow;
      });
    } else if (result) {
      const rowData = (result as unknown) as RowDataPacket;
      const mappedRow: Record<string, any> = {};
      for (const key in rowData) {
        mappedRow[key] = rowData[key];
      }
      return [mappedRow];
    }

    return [];
  }

  // Implementa otras operaciones específicas de MySQL
}