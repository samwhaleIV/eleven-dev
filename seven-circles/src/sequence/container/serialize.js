function Serialize(sqContainer) {
    const {map,decorator} = sqContainer;
    const containerFile = {map,decorator};
    const data = [];
    for(const object of Object.values(sqContainer.objects)) {
        data.push({
            type: object.type,
            data: object.serialize()
        });
    }
    containerFile.objects = data;
    return JSON.stringify(containerFile,null,4);
}
export default Serialize;
