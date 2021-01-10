import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { clickButton, typeText } from "../../commons/fireEventUtils";
import { NewTableForm } from "../NewTableForm";
import { createDatabaseTable } from "../../api/api";
import { useNavigate, useParams } from "react-router-dom";
import { ColumnType } from "../../api/models";
import userEvent from "@testing-library/user-event";
import { ROUTES } from "../../routes";

jest.mock("../../api/api");

const A_TABLE_NAME = "table_name";
const A_COLUMN_NAME = "column_name";
const A_DATABASE_NAME = "database_name";
describe("<NewTableForm />", () => {
    beforeEach(() => {
        (useParams as jest.Mock).mockReturnValue({
            databaseName: A_DATABASE_NAME,
        });
    });

    describe("on no field filled", () => {
        it("should not be possible to submit", async () => {
            render(<NewTableForm />);

            clickButton({ name: /create/i });

            await waitFor(() =>
                expect(createDatabaseTable).not.toHaveBeenCalled()
            );
        });
    });

    describe("on only table name field filled", () => {
        it("should not be possible to submit", async () => {
            render(<NewTableForm />);
            typeText("table_name").in(
                screen.getByRole("textbox", { name: /table-name/i })
            );

            clickButton({ name: /create/i });

            await waitFor(() =>
                expect(createDatabaseTable).not.toHaveBeenCalled()
            );
        });
    });

    describe("on only table column field filled", () => {
        it("should not be possible to submit", async () => {
            render(<NewTableForm />);
            clickButton({ name: /add column/i });
            typeText("column_name").in(
                screen.getByRole("textbox", { name: /column-0-name/i })
            );

            clickButton({ name: /create/i });

            await waitFor(() =>
                expect(createDatabaseTable).not.toHaveBeenCalled()
            );
        });
    });

    describe("on empty table name", () => {
        it("should not be possible to submit", async () => {
            render(<NewTableForm />);
            typeText("table_name").in(
                screen.getByRole("textbox", { name: /table-name/i })
            );
            clickButton({ name: /add column/i });

            clickButton({ name: /create/i });

            await waitFor(() =>
                expect(createDatabaseTable).not.toHaveBeenCalled()
            );
        });
    });

    describe("on table name and at least one column filled and submit", () => {
        beforeEach(() => {
            (createDatabaseTable as jest.Mock).mockResolvedValue(undefined);
            render(<NewTableForm />);
            typeText(A_TABLE_NAME).in(
                screen.getByRole("textbox", { name: /table-name/i })
            );
            clickButton({ name: /add column/i });
            typeText(A_COLUMN_NAME).in(
                screen.getByRole("textbox", { name: /column-0-name/i })
            );
        });

        it("should submit form", async () => {
            clickButton({ name: /create/i });

            await waitFor(() =>
                expect(createDatabaseTable).toHaveBeenCalledWith(
                    A_DATABASE_NAME,
                    {
                        name: A_TABLE_NAME,
                        columns: [
                            { name: A_COLUMN_NAME, type: ColumnType.TEXT },
                        ],
                    }
                )
            );
        });

        it("should redict user to the table created", async () => {
            clickButton({ name: /create/i });

            await waitFor(() =>
                expect(useNavigate()).toHaveBeenCalledWith(
                    ROUTES.databaseTable(A_DATABASE_NAME, A_TABLE_NAME)
                )
            );
        });

        describe("on column type changed", () => {
            it("should be correctly submitted", async () => {
                typeText(ColumnType.SINGLE).in(
                    screen.getByRole("textbox", { name: /column-0-type/i })
                );
                userEvent.click(screen.getByRole("option"));

                clickButton({ name: /create/i });

                await waitFor(() =>
                    expect(createDatabaseTable).toHaveBeenCalledWith(
                        A_DATABASE_NAME,
                        {
                            name: A_TABLE_NAME,
                            columns: [
                                {
                                    name: A_COLUMN_NAME,
                                    type: ColumnType.SINGLE,
                                },
                            ],
                        }
                    )
                );
            });
        });
    });
});
