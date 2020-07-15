const remote = require("electron").remote;

const TitleBar = new (function() {
    const getWindow = () => remote.getCurrentWindow();

    const rootTitle = "Sequence";
    const titleSeperator = "-";

    let title = "";
    this.getTitle = () => {
        return title;
    };

    const getDisplayTitle = () => {
        return title ? `${rootTitle} ${titleSeperator} ${title}` : rootTitle;
    };

    this.setTitle = newTitle => {
        if(!newTitle) {
            newTitle = null;
        }
        title = newTitle;
        getWindow().title = getDisplayTitle();
    };

    Object.defineProperty(this,"title",{
        get: this.getTitle,
        set: this.setTitle,
        enumerable: true
    });

    this.clearTitle = () => {
        this.setTitle(null);
    };

    this.clearTitle();
});
globalThis.TitleBar = TitleBar;

export default TitleBar;
