import {Stack} from "@mui/material";
import {FormInput} from "../../ui/FormInput";
import {VariableSelect} from "../../ui/VariableSelect";
import {Variable} from "../../model/types";
import {useAppSelector} from "../../app/hooks";
import {selectVariables} from "./modelSlice";

export const AssignForm = () => {

	const variables: Variable[] = useAppSelector(selectVariables);

	return (
		<Stack spacing={2}>
			<FormInput fieldName={"params.value"} label={"Value"} />
			<VariableSelect fieldName={"params.variable"} label={"Target Variable"} variables={variables} />
		</Stack>
	);
}
