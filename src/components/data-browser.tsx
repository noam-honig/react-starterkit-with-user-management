import { useEffect, useMemo, useState } from "react";
import { ErrorInfo, FieldMetadata, FieldsMetadata, Remult, Repository } from "remult";
import { remult } from "../common";

export interface DataBrowserProps<T> {
    repo: Repository<T>;
    hideFields?: (f: FieldsMetadata<T>) => FieldMetadata[]
}


function DataBrowser<T>({ repo, hideFields }: DataBrowserProps<T>) {
    const fields = useMemo(() => {
        let exclude: FieldMetadata[] = []
        if (hideFields)
            exclude = hideFields(repo.metadata.fields);
        return repo.metadata.fields.toArray().filter(f => !exclude.includes(f)).filter(f => f.options.includeInApi === undefined || remult.isAllowed(f.options.includeInApi));
    }, [hideFields]);
    const [items, setItems] = useState<any[]>([]);
    useEffect(() => {
        repo.find().then(setItems);
    }, []);
    const [editItem, setEditItem] = useState<any>();
    const [editState, setEditState] = useState<any>();
    const [error, setError] = useState<ErrorInfo<T>>();
    useEffect(() => setEditState(editItem ? { ...editItem } : undefined), [editItem]);
    const save = async () => {
        let isNew = !Boolean(editState.id);
        try {
            setError(undefined);
            let savedItem = await repo.save(editState);
            if (isNew)
                setItems([...items, savedItem]);
            else
                setItems(items.map(x => x === editItem ? savedItem : x));
            setEditItem(undefined);

        }
        catch (error: any) {
            if (!error.modelState)
                alert(error.message);
            setError(error);
        }
    };
    const deleteItem = async () => {
        await repo.delete(editItem);
        setItems(items.filter(i => i !== editItem));
        setEditItem(undefined);
    }
    return <div>
        <h1>{repo.metadata.caption}</h1>
        <table >
            <thead>
                <tr>
                    {fields.map(f => {
                        return <th key={f.key}>{f.caption}</th>
                    })}
                </tr>
            </thead>
            <tbody>
                {items.map(row => <tr key={row.id} onClick={() => setEditItem(row)}>
                    {fields.map(f => <td key={f.key}>{displayValue(f, row)}</td>)}
                </tr>)}
            </tbody>
        </table>

        {editState && <dialog open={Boolean(editState)}>
            <table>
                <tbody>
                    {fields.map(f => <tr key={f.key}>
                        <td>{f.caption}</td>
                        <td>
                            {isReadonly(f, remult) ? displayValue(f, editState) :
                                f.inputType === "checkbox" ?
                                    <input checked={editState[f.key]}
                                        type="checkbox"
                                        onChange={e => setEditState({ ...editState, [f.key]: e.target.checked })}
                                    />
                                    :
                                    <input value={toInputValue(f, editState)}
                                        type={f.inputType}
                                        onChange={e => setEditState({ ...editState, [f.key]: fromInputValue(f, e.target.value) })} />
                            }
                            <div style={{ fontSize: 'small', color: 'red' }}>{error?.modelState &&
                                //@ts-ignore
                                error.modelState[f.key]}
                            </div>

                        </td>
                    </tr>)}
                </tbody>
            </table>
            <button onClick={save}>Save</button>
            <button onClick={() => setEditItem(undefined)}>Close</button>
            <button onClick={deleteItem}>Delete</button>
        </dialog>}
        <button onClick={() => setEditItem({ ...repo.create(), id: undefined })}>Add Item</button>
    </div>
}
export default DataBrowser;


function displayValue(f: FieldMetadata, row: any) {
    let val = row[f.key];
    if (val === undefined)
        return '';
    if (val === null)
        return 'null';
    if (f.options.displayValue)
        return f.options.displayValue(row, val);
    if (f.options.valueConverter?.displayValue)
        return f.valueConverter!.displayValue!(val);
    return val.toString();
}
function toInputValue(f: FieldMetadata, row: any) {
    const val = row[f.key];
    if (f.options.valueConverter?.toInput)
        return f.options.valueConverter.toInput(val, f.inputType);
    if (val === undefined || val === null)
        return '';
    return val.toString();;
}
function fromInputValue(f: FieldMetadata, val: string) {
    if (f.options.valueConverter?.fromInput)
        return f.options.valueConverter.fromInput(val, f.inputType);
    return val;
}

function isReadonly(f: FieldMetadata, remult: Remult) {
    return f.isServerExpression
        || f.options.allowApiUpdate !== undefined && !remult.isAllowed(f.options.allowApiUpdate!)
        || f.options.includeInApi !== undefined && !remult.isAllowed(f.options.includeInApi!)
}