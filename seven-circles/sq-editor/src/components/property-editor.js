function InstallPropertyEditor(world) {
    let item = null, hasItem = false;
    world.selectionChanged = newItem => {
        item = newItem;
        hasItem = item !== null;
    };

}
export default InstallPropertyEditor;
