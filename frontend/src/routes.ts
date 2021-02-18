export const ROUTES = {
    database: (name: string) => `/databases/${name}`,

    databaseGodMode: (databaseName: string) =>
        `/databases/${databaseName}/query`,
    databaseTable: (databaseName: string, tableName: string) =>
        `${ROUTES.database(databaseName)}/tables/${tableName}`,

    newDatabaseTable: () => `new-table`,
};
