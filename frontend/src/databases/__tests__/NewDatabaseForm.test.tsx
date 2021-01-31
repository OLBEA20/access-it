import { act, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { clickButton, dropFile, typeText } from "../../commons/fireEventUtils";
import { NewDatabaseForm } from "../NewDatabaseForm";

const mockedOnCreate = jest.fn();

const A_DATABASE_NAME = "database-name";
const A_DATABASE_FILE = new File(["file"], `${A_DATABASE_NAME}.mdb`, {
    type: "application/vnd.ms-access",
});

describe("<NewDatabaseFromt />", () => {
    describe("on name entered", () => {
        describe("on submit", () => {
            it("should create database", async () => {
                render(<NewDatabaseForm onCreate={mockedOnCreate} />);

                typeText(A_DATABASE_NAME).in(
                    screen.getByRole("textbox", { name: /database name/i })
                );
                clickButton({ name: /create/i });

                await waitFor(() =>
                    expect(mockedOnCreate).toHaveBeenCalledWith(
                        A_DATABASE_NAME,
                        undefined
                    )
                );
            });
        });

        describe("on file selected", () => {
            it("should create database with file", async () => {
                render(<NewDatabaseForm onCreate={mockedOnCreate} />);

                await dropFile(A_DATABASE_FILE).in(
                    screen.getByTestId("dropzone")
                );
                clickButton({ name: /create/i });

                await waitFor(() =>
                    expect(mockedOnCreate).toHaveBeenCalledWith(
                        A_DATABASE_NAME,
                        A_DATABASE_FILE
                    )
                );
            });
        });

        it("should reset state", async () => {
            render(<NewDatabaseForm onCreate={mockedOnCreate} />);

            await dropFile(A_DATABASE_FILE).in(screen.getByTestId("dropzone"));
            act(() => clickButton({ name: /create/i }));
            clickButton({ name: /create/i });

            expect(mockedOnCreate).toHaveBeenCalledTimes(1);
        });
    });

    describe("on cancel", () => {
        it("should reset state", async () => {
            render(<NewDatabaseForm onCreate={mockedOnCreate} />);

            await dropFile(A_DATABASE_FILE).in(screen.getByTestId("dropzone"));
            clickButton({ name: /cancel/i });
            clickButton({ name: /create/i });

            await waitFor(() => expect(mockedOnCreate).not.toHaveBeenCalled());
        });
    });
});
