const MirrorProperty = (watchers,target,key) => {
    let handlers = {}, list = [], counter = 0;

    const update = () => {
        list = Object.values(handlers);
    };
    const fire = value => {
        for(const handler of list) {
            handler(value);
        }
    };
    const add = handler => {
        const ID = counter;
        counter += 1;
        handlers[ID] = handler;
        update();
        return ID;
    };
    const remove = ID => {
        delete handlers[ID];
        update();
    };

    watchers[key] = {add,remove,fire};
    Object.defineProperty(target,key,{
        get: () => target.getProperty(key),
        set: value => target.setProperty(key,value),
        enumerable: true
    });
};

export default MirrorProperty;
