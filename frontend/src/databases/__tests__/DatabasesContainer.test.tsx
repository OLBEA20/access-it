import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { createDatabase, listDatabases } from "../../api/api";
import { DatabasesContainer } from "../DatabasesContainer";
import { clickButton, typeText } from "../../commons/fireEventUtils";
import { useNavigate } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { ROUTES } from "../../routes";

const SOME_DATABASES_NAME = ["a", "b"];
const NEW_DATABASE = "new-database";

jest.mock("../../api/api");
jest.mock("react-router-dom");

describe("<DatabasesContainer />", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (listDatabases as jest.Mock).mockResolvedValue({
            names: SOME_DATABASES_NAME,
        });
        (createDatabase as jest.Mock).mockImplementation((name) =>
            Promise.resolve({ name })
        );
    });

    describe("on render", () => {
        it("should list databases", async () => {
            render(<DatabasesContainer />);

            await waitFor(() =>
                SOME_DATABASES_NAME.forEach((name) =>
                    expect(
                        screen.getByText(name, { exact: false })
                    ).toBeInTheDocument()
                )
            );
        });
    });

    describe("on new database", () => {
        beforeEach(async () => {
            await act(async () => {
                render(<DatabasesContainer />);
            });
        });

        describe("on success", () => {
            beforeEach(async () => {
                clickButton({ name: /addResource/i });
                typeText(NEW_DATABASE).in(screen.getByRole("textbox"));
                await act(async () => clickButton({ name: /save/i }));
            });

            it("should create a new database", () => {
                expect(createDatabase).toHaveBeenCalledWith(NEW_DATABASE);
            });

            it("should append it to the database list", async () => {
                expect(
                    await screen.findByText(NEW_DATABASE, { exact: false })
                ).toBeInTheDocument();
            });
        });

        describe("on failure", () => {
            it("should not append anything", async () => {
                (createDatabase as jest.Mock).mockRejectedValue(undefined);
                clickButton({ name: /addResource/i });
                typeText(NEW_DATABASE).in(screen.getByRole("textbox"));
                clickButton({ name: /save/i });

                await waitFor(() =>
                    expect(screen.getAllByTestId("database-item")).toHaveLength(
                        SOME_DATABASES_NAME.length
                    )
                );
            });
        });
    });

    describe("on database item click", () => {
        it("should navigate to database page", async () => {
            render(<DatabasesContainer />);

            userEvent.click(
                await screen.findByRole("button", {
                    name: SOME_DATABASES_NAME[0],
                })
            );

            await waitFor(() =>
                expect(useNavigate()).toHaveBeenCalledWith(
                    ROUTES.database(SOME_DATABASES_NAME[0])
                )
            );
        });
    });
});
