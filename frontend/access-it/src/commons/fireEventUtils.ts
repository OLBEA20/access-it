import { fireEvent, screen } from "@testing-library/react";
import { ByRoleOptions } from "@testing-library/react";
import userEvent, { TargetElement } from "@testing-library/user-event";

export const clickButton = (options?: ByRoleOptions) =>
    userEvent.click(screen.getByRole("button", options));

export const typeText = (text: string) => ({
    in: (element: TargetElement) =>
        fireEvent.input(element, { target: { value: text } }),
});

export const ENTER_KEY = { key: "Enter", which: 13, code: "Enter" };
export const ESCAPE_KEY = { key: "Escape", which: 27, code: "Escape" };
