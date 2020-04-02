/* This acts for protocol based inheritance */

const SERIALIZE_SYMBOL = Symbol("Serializable");

const DESERIALIZE_FLAG = "_deserialize"; //If you change this, you will break all currently saved containers

const IS_SERIALIZABLE = container => {
    if(typeof container !== "object") return false;
    return Boolean(container[SERIALIZE_SYMBOL]);
};

const SerializeHelper = Object.freeze({
    IsSerializable: IS_SERIALIZABLE,
    Symbol: SERIALIZE_SYMBOL,
    DeserializeFlag: DESERIALIZE_FLAG
});
export default SerializeHelper;
