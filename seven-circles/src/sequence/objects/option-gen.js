const OptionGen = (property,options,displayName) => {
    const optionsList = new Array();
    const inverseOptions = new Object();
    for(const [key,value] of Object.entries(options)) {
        optionsList.push(key);
        inverseOptions[value] = key;
    }
    const serialize = ({self}) => {
        return self.sprite[property];
    };
    const getOption = ({self}) => {
        const value = inverseOptions[
            self.sprite[property]
        ];
        return value;
    };
    const setOption = ({self},value) => {
        const newValue = options[value];
        self.sprite[property] = newValue;
    };
    const data = {
        get: getOption, set: setOption,
        serialize, options: optionsList,
    };
    if(displayName) data.name = displayName;
    return data;
};
export default OptionGen;
