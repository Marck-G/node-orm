export interface DatabaseAdapter{
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    createTable( tableName : string, columns: ColumnDefinition[]) : Promise<void>;
    prepare(sql: string, values: Record<string, any>): Promise<any[]>;
}

export interface ColumnDefinition {
    name: string;
    type: string;
    primaryKey?: boolean;
    default?: string;
  }

export interface TableSchema {
    tableName: string;
    columns: ColumnDefinition[];
  }