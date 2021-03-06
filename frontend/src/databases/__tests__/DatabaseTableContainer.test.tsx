import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { insertRowInDatabaseTable, readDatabaseTable } from "../../api/api";
import { DatabaseTableContainer } from "../DatabaseTableContainer";
import { useParams } from "react-router-dom";
import { clickButton, typeText } from "../../commons/fireEventUtils";
import { useWindowSize } from "../../utils/useWindowSize";

jest.mock("react-router-dom");
jest.mock("../../api/api");
jest.mock("../../utils/useWindowSize");

const A_TABLE = {
    name: "table_name",
    columns_description: [
        {
            name: "column_a",
            type_code: "VARCHAR",
            display_size: 255,
            internal_size: 255,
            precision: 0,
            scale: 0,
            nullable: false,
        },
        {
            name: "column_b",
            type_code: "FLOAT",
            display_size: 23,
            internal_size: 23,
            precision: 0,
            scale: 0,
            nullable: true,
        },
    ],
    rows: [
        ["a", "b"],
        ["c", "d"],
    ],
};

const A_VALUE = "a_value";
const ANOTHER_VALUE = "another_value";
describe("<DatabaseTableContainer />", () => {
    beforeEach(async () => {
        (useParams as jest.Mock).mockReturnValue({
            databaseName: "database",
            tableName: "table",
        });
        (readDatabaseTable as jest.Mock).mockResolvedValue(A_TABLE);
        (useWindowSize as jest.Mock).mockReturnValue({
            width: 150,
            height: 150,
        });
        await act(async () => {
            render(<DatabaseTableContainer />);
        });
    });

    it("should display columns name", async () => {
        await waitFor(() =>
            A_TABLE.columns_description.map(({ name }) =>
                expect(screen.getByText(name)).toBeInTheDocument()
            )
        );
    });

    it.skip("should display all rows values", async () => {
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

            expect(
                await screen.findByRole("form", { name: /new row/i })
            ).toBeInTheDocument();
        });

        it("should hide add row button", async () => {
            clickButton({ name: /add row/i });

            await waitFor(() =>
                expect(
                    screen.queryByRole("button", { name: /add row/i })
                ).not.toBeInTheDocument()
            );
        });

        describe("on cancel", () => {
            it("should hide new row form", async () => {
                clickButton({ name: /add row/i });

                clickButton({ name: /cancel/i });

                await waitFor(() =>
                    expect(
                        screen.queryByRole("form", { name: /new row/i })
                    ).not.toBeInTheDocument()
                );
            });

            it("should display add row button", async () => {
                clickButton({ name: /add row/i });

                clickButton({ name: /cancel/i });

                expect(
                    await screen.findByRole("button", { name: /add row/i })
                ).toBeInTheDocument();
            });
        });
    });

    describe("on submit", () => {
        it("should add new row", async () => {
            clickButton({ name: /add row/i });

            typeText(A_VALUE).in(
                screen.getByRole("textbox", {
                    name: A_TABLE.columns_description[0].name,
                })
            );
            typeText(ANOTHER_VALUE).in(
                screen.getByRole("textbox", {
                    name: A_TABLE.columns_description[1].name,
                })
            );
            clickButton({ name: /add/i });

            await waitFor(() =>
                expect(insertRowInDatabaseTable).toHaveBeenCalledWith(
                    "database",
                    "table",
                    [
                        [A_TABLE.columns_description[0].name, A_VALUE],
                        [A_TABLE.columns_description[1].name, ANOTHER_VALUE],
                    ]
                )
            );
        });

        it("should hide new row form", async () => {
            clickButton({ name: /add row/i });

            clickButton({ name: /add/i });

            await waitFor(() =>
                expect(
                    screen.queryByRole("form", { name: /new row/i })
                ).not.toBeInTheDocument()
            );
        });

        it("should display add row button", async () => {
            clickButton({ name: /add row/i });

            clickButton({ name: /add/i });

            expect(
                await screen.findByRole("button", { name: /add row/i })
            ).toBeInTheDocument();
        });
    });

    describe("on description button click", () => {
        it("should display table description", () => {
            clickButton({ name: /description/i });

            A_TABLE.columns_description.forEach((description) =>
                expect(
                    screen.getByRole("row", { name: description.name })
                ).toBeInTheDocument()
            );
        });
    });
});
