import { render, waitFor, screen } from "@testing-library/react";
import React from "react";
import { clickButton, typeText } from "../../commons/fireEventUtils";
import { NewRowForm } from "../NewRowForm";

const SOME_COLUMNS_NAME = ["a_column", "another_column"];

const mockedOnSubmit = jest.fn();

const A_VALUE = "a_value";
const ANOTHER_VALUE = "another_value";
describe("<NewRowForm />", () => {
    it("should display columns name", async () => {
        render(
            <NewRowForm
                columns={SOME_COLUMNS_NAME}
                onCancel={jest.fn()}
                onSubmit={jest.fn()}
            />
        );

        await waitFor(() =>
            SOME_COLUMNS_NAME.map((column) =>
                expect(screen.getByText(column)).toBeInTheDocument()
            )
        );
    });

    describe("on save", () => {
        it("should submit values", async () => {
            render(
                <NewRowForm
                    columns={SOME_COLUMNS_NAME}
                    onCancel={jest.fn()}
                    onSubmit={mockedOnSubmit}
                />
            );

            typeText(A_VALUE).in(
                screen.getByRole("textbox", { name: SOME_COLUMNS_NAME[0] })
            );
            typeText(ANOTHER_VALUE).in(
                screen.getByRole("textbox", { name: SOME_COLUMNS_NAME[1] })
            );
            clickButton({ name: /add/i });

            await waitFor(() =>
                expect(mockedOnSubmit).toHaveBeenCalledWith({
                    [SOME_COLUMNS_NAME[0]]: A_VALUE,
                    [SOME_COLUMNS_NAME[1]]: ANOTHER_VALUE,
                })
            );
        });
    });
});
