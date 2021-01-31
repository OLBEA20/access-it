import React, { useState } from "react";
import {
    IconButton,
    ListItem,
    ListItemText,
    makeStyles,
    Theme,
} from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes";
import { DeleteOutlined } from "@material-ui/icons";

const useStyle = makeStyles((theme: Theme) => ({
    selectedDatabase: {
        backgroundColor: theme.palette.action.selected,
    },
    deleteButton: ({ visible }: { visible: boolean }) => ({
        opacity: visible ? 1 : 0,
        transition: theme.transitions.create("opacity", {
            duration: theme.transitions.duration.shortest,
        }),
    }),
}));

interface Props {
    selected: boolean;
    name: string;
    onDelete: () => void;
}

export function DatabaseRow({ name, selected, onDelete }: Props) {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const classes = useStyle({ visible: isHovered });

    return (
        <ListItem
            className={selected ? classes.selectedDatabase : undefined}
            button
            disableGutters
            data-testid={`database-item`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => navigate(ROUTES.database(name))}
        >
            <ListItemText>{name}</ListItemText>
            <IconButton
                className={classes.deleteButton}
                aria-label={`delete ${name}`}
                size="small"
                onClick={(event) => {
                    event.stopPropagation();
                    onDelete();
                }}
            >
                <DeleteOutlined color="error" />
            </IconButton>
        </ListItem>
    );
}
