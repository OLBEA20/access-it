import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { listDatabaseTables } from "../../api/api";
import { DatabaseContainer } from "../DatabaseContainer";
import { useNavigate, useParams } from "react-router-dom";
import { clickButton } from "../../commons/fireEventUtils";
import { ROUTES } from "../../routes";

const A_DATABASE_NAME = "database-name";
const SOME_DATABASE_TABLES = ["table_1", "table_2"];

jest.mock("../../api/api");
jest.mock("react-router-dom");

describe("<DatabaseContainer />", () => {
    beforeEach(async () => {
        (useParams as jest.Mock).mockReturnValue({
            databaseName: A_DATABASE_NAME,
        });
    });

    describe("while database tables loads", () => {
        it("should display loading progress", async () => {
            (listDatabaseTables as jest.Mock).mockImplementation(
                () => new Promise(() => {})
            );
            render(<DatabaseContainer />);

            expect(await screen.findByRole("progressbar")).toBeInTheDocument();
        });
    });
    describe("on database tables loaded", () => {
        beforeEach(async () => {
            (listDatabaseTables as jest.Mock).mockResolvedValue({
                tables: SOME_DATABASE_TABLES,
            });

            await act(async () => {
                render(<DatabaseContainer />);
            });
        });

        it("should render tables", async () => {
            await waitFor(() =>
                SOME_DATABASE_TABLES.map((table) =>
                    expect(screen.getByText(table)).toBeInTheDocument()
                )
            );
        });

        describe("on add button click", () => {
            it("should redirect to new table form", async () => {
                clickButton({ name: /add/i });

                await waitFor(() =>
                    expect(useNavigate()).toHaveBeenCalledWith(
                        ROUTES.newDatabaseTable()
                    )
                );
            });
        });

        describe("on table name click", () => {
            it("should redirect to table page", async () => {
                clickButton({ name: SOME_DATABASE_TABLES[0] });

                await waitFor(() =>
                    expect(useNavigate()).toHaveBeenCalledWith(
                        ROUTES.databaseTable(
                            A_DATABASE_NAME,
                            SOME_DATABASE_TABLES[0]
                        )
                    )
                );
            });
        });

        describe("on god mod button click", () => {
            it("should redirect to sql query page", async () => {
                clickButton({ name: /god mode/i });

                await waitFor(() =>
                    expect(useNavigate()).toHaveBeenCalledWith(
                        ROUTES.databaseGodMode(A_DATABASE_NAME)
                    )
                );
            });
        });
    });
});
