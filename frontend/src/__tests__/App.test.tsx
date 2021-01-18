import React from "react";
import { render } from "@testing-library/react";
import { App } from "../App";

const SOME_DATABASES_NAME = ["a", "b"];

jest.mock("../api/api");
jest.unmock("react-router-dom");

describe("on render", () => {
    it("should render", async () => {
        render(<App />);
    });
});
