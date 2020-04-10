function Key(type) {
    this.retain = true;
    this.action = ({script}) => {
        if(script.useKey) {
            return script.useKey(type);
        }
        return false;
    };
}
export default Key;
