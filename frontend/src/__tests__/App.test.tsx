import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { App } from "../App";
import { listDatabases } from "../api/api";

const SOME_DATABASES_NAME = ["a", "b"];

jest.mock("../api/api");
jest.unmock("react-router-dom");

describe("on render", () => {
    it("should list databases", async () => {
        (listDatabases as jest.Mock).mockResolvedValue({ names: ["a", "b"] });

        render(<App />);

        await waitFor(() =>
            SOME_DATABASES_NAME.forEach((name) =>
                expect(
                    screen.getByText(name, { exact: false })
                ).toBeInTheDocument()
            )
        );
    });
});
