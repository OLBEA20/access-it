export const ROUTES = {
    database: (name: string) => `/databases/${name}`,
    databaseTable: (databaseName: string, tableName: string) =>
        `${ROUTES.database(databaseName)}/tables/${tableName}`,
    newDatabaseTable: () => `new-table`,
};
