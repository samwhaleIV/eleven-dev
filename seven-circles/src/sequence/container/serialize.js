function Serialize(sqContainer) {
    const {map,decorator} = sqContainer;
    const objects = [];

    const objectsList = Object.values(sqContainer.objects);

    for(const object of objectsList) {
        objects.push({
            type: object.type,
            data: object.serialize()
        });
    }

    const containerData = {map,decorator,objects};
    return containerData;
}
export default Serialize;
