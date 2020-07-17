const OptionGen = (property,options) => {
    const optionsList = new Array();
    const inverseOptions = new Object();
    for(const [key,value] of Object.entries(options)) {
        optionsList.push(key);
        inverseOptions[value] = key;
    }
    const getOption = ({self}) => {
        const value = inverseOptions[self.sprite[property]];
        return value;
    };
    const setOption = ({self},value) => {
        const newValue = options[value];
        self.sprite[property] = newValue;
    };
    return {
        get:getOption,set:setOption,options:optionsList
    };
};
export default OptionGen;
