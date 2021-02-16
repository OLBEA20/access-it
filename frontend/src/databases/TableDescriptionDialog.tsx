import {
    Dialog,
    DialogContent,
    DialogTitle,
    Table,
    TableCell,
    TableHead,
    TableBody,
    TableRow,
    makeStyles,
    Theme,
} from "@material-ui/core";
import { CheckOutlined, CloseOutlined } from "@material-ui/icons";
import clsx from "clsx";
import React from "react";
import { ColumnDescription } from "../api/models";

const useStyle = makeStyles((theme: Theme) => ({
    tableHead: {
        backgroundColor: theme.palette.primary.light,
    },
    content: {
        fontWeight: theme.typography.fontWeightBold,
    },
    odd: {
        backgroundColor: theme.palette.action.hover,
    },
    check: {
        color: theme.palette.success.main,
    },
}));

interface Props {
    columnsDescription: ColumnDescription[];
    onClose: () => void;
    open: boolean;
}

export function TableDescriptionDialog({
    columnsDescription,
    onClose,
    open,
}: Props) {
    const classes = useStyle();

    return (
        <Dialog open={open} onClose={onClose} maxWidth={false}>
            <DialogTitle>Description</DialogTitle>
            <DialogContent>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.tableHead}>
                                Name
                            </TableCell>
                            <TableCell className={classes.tableHead}>
                                Type
                            </TableCell>
                            <TableCell
                                className={classes.tableHead}
                                align="right"
                            >
                                Display size
                            </TableCell>
                            <TableCell
                                className={classes.tableHead}
                                align="right"
                            >
                                Size
                            </TableCell>
                            <TableCell
                                className={classes.tableHead}
                                align="right"
                            >
                                Precision
                            </TableCell>
                            <TableCell
                                className={classes.tableHead}
                                align="right"
                            >
                                Scale
                            </TableCell>
                            <TableCell className={classes.tableHead}>
                                Nullable
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {columnsDescription.map((description, index) => {
                            const className = clsx(
                                classes.content,
                                index % 2 !== 0 ? classes.odd : undefined
                            );
                            return (
                                <TableRow
                                    key={description.name}
                                    aria-label={description.name}
                                >
                                    <TableCell className={className}>
                                        {description.name}
                                    </TableCell>
                                    <TableCell className={className}>
                                        {description.type_code}
                                    </TableCell>
                                    <TableCell
                                        className={className}
                                        align="right"
                                    >
                                        {description.display_size}
                                    </TableCell>
                                    <TableCell
                                        className={className}
                                        align="right"
                                    >
                                        {description.internal_size}
                                    </TableCell>
                                    <TableCell
                                        className={className}
                                        align="right"
                                    >
                                        {description.precision}
                                    </TableCell>
                                    <TableCell
                                        className={className}
                                        align="right"
                                    >
                                        {description.scale}
                                    </TableCell>
                                    <TableCell className={className}>
                                        {description.nullable ? (
                                            <CheckOutlined
                                                className={classes.check}
                                            />
                                        ) : (
                                            <CloseOutlined color="error" />
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </DialogContent>
        </Dialog>
    );
}
