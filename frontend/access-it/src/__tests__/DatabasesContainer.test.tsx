import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { createDatabase, listDatabases } from "../api";
import { DatabasesContainer } from "../DatabasesContainer";
import { clickButton, typeText } from "../commons/fireEventUtils";

const SOME_DATABASES_NAME = ["a", "b"];
const NEW_DATABASE = "new-database";

jest.mock("../api");

describe("<DatabasesContainer />", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (listDatabases as jest.Mock).mockResolvedValue({
            names: ["a", "b"],
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
            render(<DatabasesContainer />);

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
});
