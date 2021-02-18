import React from "react";
import { render, screen } from "@testing-library/react";
import { DatabaseQueryPage } from "../DatabaseQueryPage";
import { clickButton, typeText } from "../../../commons/fireEventUtils";
import { updateDatabase } from "../../../api/api";
import { useParams } from "react-router-dom";

jest.mock("../../../api/api");
jest.mock("react-router-dom");

const A_DATABASE_NAME = "database-name";

describe("<DatabaseQueryPage />", () => {
    beforeEach(() => {
        (useParams as jest.Mock).mockReturnValue({
            databaseName: A_DATABASE_NAME,
        });
    });

    describe("on update query", () => {
        it("should update database", () => {
            const updateStatement = "UPDATE table set column='new value';";
            render(<DatabaseQueryPage />);

            typeText(updateStatement).in(screen.getByRole("textbox"));
            clickButton({ name: /execute/i });

            expect(updateDatabase).toHaveBeenCalledWith(
                A_DATABASE_NAME,
                updateStatement
            );
        });
    });
});
