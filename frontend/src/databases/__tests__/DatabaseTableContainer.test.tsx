import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { readDatabaseTable } from "../../api/api";
import { ColumnType } from "../../api/models";
import { DatabaseTableContainer } from "../DatabaseTableContainer";
import { useParams } from "react-router-dom";
import { clickButton } from "../../commons/fireEventUtils";

jest.mock("react-router-dom");
jest.mock("../../api/api");

const A_TABLE = {
    name: "table_name",
    columns: ["column_a", "column_b"],
    rows: [
        ["a", "b"],
        ["c", "d"],
    ],
};

describe("<DatabaseTableContainer />", () => {
    beforeEach(async () => {
        (useParams as jest.Mock).mockReturnValue({
            databaseName: "database",
            tableName: "table",
        });
        (readDatabaseTable as jest.Mock).mockResolvedValue(A_TABLE);
        await act(async () => {
            render(<DatabaseTableContainer />);
        });
    });

    it("should display columns name", async () => {
        await waitFor(() =>
            A_TABLE.columns.map((name) =>
                expect(screen.getByText(name)).toBeInTheDocument()
            )
        );
    });

    it("should display all rows values", async () => {
        await waitFor(() =>
            A_TABLE.rows.map((row) =>
                row.map((value) =>
                    expect(screen.getByText(value)).toBeInTheDocument()
                )
            )
        );
    });

    describe("on add row button click", () => {
        it("should open new row form", async () => {
            clickButton({ name: /add row/i });

            expect(await screen.findByRole("form", { name: /new row/i }));
        });
    });
});
