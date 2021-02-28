import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import {
    createDatabase,
    deleteDatabase,
    downloadDatabase,
    listDatabases,
} from "../../api/api";
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
                    expect(screen.getByText(name)).toBeInTheDocument()
                )
            );
        });
    });

    describe("on hover database name", () => {
        it("should display download icon", async () => {
            render(<DatabasesContainer />);

            userEvent.hover((await screen.findAllByTestId("database-item"))[0]);

            expect(
                (
                    await screen.findAllByRole("button", {
                        name: /download database/i,
                    })
                )[0]
            ).toBeVisible();
        });
    });

    describe("on download button click", () => {
        it("should download database", async () => {
            render(<DatabasesContainer />);

            userEvent.hover((await screen.findAllByTestId("database-item"))[0]);
            userEvent.click(
                (
                    await screen.findAllByRole("button", {
                        name: /download database/i,
                    })
                )[0]
            );

            await waitFor(() =>
                expect(downloadDatabase).toHaveBeenCalledWith(
                    SOME_DATABASES_NAME[0]
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
                typeText(NEW_DATABASE).in(
                    screen.getByRole("textbox", { name: /database name/i })
                );
                await act(async () => clickButton({ name: /create/i }));
            });

            it("should create a new database", () => {
                expect(createDatabase).toHaveBeenCalledWith(
                    NEW_DATABASE,
                    undefined
                );
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
                typeText(NEW_DATABASE).in(
                    screen.getByRole("textbox", { name: /database name/i })
                );
                clickButton({ name: /create/i });

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

    describe("on delete database", () => {
        beforeEach(() => {
            (deleteDatabase as jest.Mock).mockResolvedValue({
                names: SOME_DATABASES_NAME.slice(1),
            });
        });

        it("should delete database", async () => {
            render(<DatabasesContainer />);

            userEvent.hover(await screen.findByText(SOME_DATABASES_NAME[0]));
            clickButton({ name: `delete ${SOME_DATABASES_NAME[0]}` });

            await waitFor(() =>
                expect(deleteDatabase).toHaveBeenLastCalledWith(
                    SOME_DATABASES_NAME[0]
                )
            );
        });

        it("should update databases list", async () => {
            (deleteDatabase as jest.Mock).mockResolvedValue({
                names: SOME_DATABASES_NAME.slice(1),
            });

            render(<DatabasesContainer />);

            userEvent.hover(await screen.findByText(SOME_DATABASES_NAME[0]));
            clickButton({ name: `delete ${SOME_DATABASES_NAME[0]}` });

            await waitFor(() =>
                expect(
                    screen.queryByText(SOME_DATABASES_NAME[0])
                ).not.toBeInTheDocument()
            );
        });
    });
});
