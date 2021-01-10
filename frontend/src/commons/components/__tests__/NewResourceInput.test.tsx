import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { TargetElement } from "@testing-library/user-event";
import React from "react";
import {
  clickButton,
  ENTER_KEY,
  ESCAPE_KEY,
  typeText,
} from "../../fireEventUtils";
import { NewResourceInput } from "../NewResourceInput";

const mockedOnSave = jest.fn();

const A_RESOURCE_NAME = "a resource name";
describe("<NewResourceInput />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("on add button click", () => {
    beforeEach(() => {
      render(<NewResourceInput onSave={mockedOnSave} />);

      clickButton({ name: /addResource/i });
    });

    it("should change to input", () => {
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    describe.each`
      testCase         | submitForm
      ${"click save"}  | ${() => clickButton({ name: /save/i })}
      ${"press enter"} | ${(input: TargetElement) => fireEvent.keyDown(input, ENTER_KEY)}
    `("on submit value ($testCase)", ({ submitForm }) => {
      it("should submit resource name", () => {
        typeText(A_RESOURCE_NAME).in(screen.getByRole("textbox"));

        submitForm(screen.getByRole("textbox"));

        expect(mockedOnSave).toHaveBeenCalledWith(A_RESOURCE_NAME);
      });

      it("should clear input", () => {
        typeText(A_RESOURCE_NAME).in(screen.getByRole("textbox"));

        submitForm(screen.getByRole("textbox"));
        clickButton({ name: /addResource/i });

        expect(screen.getByRole("textbox")).not.toHaveValue(A_RESOURCE_NAME);
      });
    });

    describe("on escape", () => {
      it("should close input", () => {
        typeText(A_RESOURCE_NAME).in(screen.getByRole("textbox"));

        fireEvent.keyDown(screen.getByRole("textbox"), ESCAPE_KEY);

        expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
      });
    });
  });
});
