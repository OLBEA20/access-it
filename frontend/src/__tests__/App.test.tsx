import React from "react";
import { act, render } from "@testing-library/react";
import { App } from "../App";
import { listDatabases } from "../api/api";

const SOME_DATABASES_NAME = ["a", "b"];

jest.mock("../api/api");
jest.unmock("react-router-dom");

describe("on render", () => {
    beforeEach(() => {
        (listDatabases as jest.Mock).mockResolvedValue({ names: [] });
    });
    it("should render", async () => {
        await act(async () => {
            render(<App />);
        });
    });
});
