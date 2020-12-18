interface ListDabataseResponse {
    names: string[];
}

interface Database {
    name: string;
}

export function listDatabases(): Promise<ListDabataseResponse> {
    return fetch("http://localhost:8000/databases").then((response) =>
        response.json()
    );
}

export function createDatabase(name: string): Promise<Database> {
    return fetch("http://localhost:8000/databases", {
        method: "Post",
        body: JSON.stringify({ name }),
    }).then((response) => response.json());
}
