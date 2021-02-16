import { render, waitFor, screen } from "@testing-library/react";
import React from "react";
import { clickButton, typeText } from "../../commons/fireEventUtils";
import { NewRowForm } from "../NewRowForm";

const SOME_COLUMNS_DESCRIPTION = [
    {
        name: "a_column",
        type_code: "VARCHAR",
        display_size: 255,
        internal_size: 255,
        precision: 0,
        scale: 0,
        nullable: true,
    },
    {
        name: "another_column",
        type_code: "FLOAT",
        display_size: 23,
        internal_size: 23,
        precision: 0,
        scale: 0,
        nullable: false,
    },
];

const mockedOnSubmit = jest.fn();

const A_VALUE = "a_value";
const ANOTHER_VALUE = "another_value";
describe("<NewRowForm />", () => {
    it("should display columns name", async () => {
        render(
            <NewRowForm
                columns={SOME_COLUMNS_DESCRIPTION}
                onCancel={jest.fn()}
                onSubmit={jest.fn()}
            />
        );

        await waitFor(() =>
            SOME_COLUMNS_DESCRIPTION.map((column) =>
                expect(screen.getByText(column.name)).toBeInTheDocument()
            )
        );
    });

    describe("on save", () => {
        it("should submit values", async () => {
            render(
                <NewRowForm
                    columns={SOME_COLUMNS_DESCRIPTION}
                    onCancel={jest.fn()}
                    onSubmit={mockedOnSubmit}
                />
            );

            typeText(A_VALUE).in(
                screen.getByRole("textbox", {
                    name: SOME_COLUMNS_DESCRIPTION[0].name,
                })
            );
            typeText(ANOTHER_VALUE).in(
                screen.getByRole("textbox", {
                    name: SOME_COLUMNS_DESCRIPTION[1].name,
                })
            );
            clickButton({ name: /add/i });

            await waitFor(() =>
                expect(mockedOnSubmit).toHaveBeenCalledWith({
                    [SOME_COLUMNS_DESCRIPTION[0].name]: A_VALUE,
                    [SOME_COLUMNS_DESCRIPTION[1].name]: ANOTHER_VALUE,
                })
            );
        });
    });
});
